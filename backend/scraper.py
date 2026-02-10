import time
import random
import concurrent.futures
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from textblob import TextBlob
from database import get_db_connection
import re

# CONFIGURATION
CACHE_DURATION_HOURS = 24
MAX_REVIEWS_PER_SOURCE = 25  # Increased for better analysis
MAX_WORKERS = 2 

def clean_text(text):
    """Cleans text by removing special characters and extra spaces."""
    if not text:
        return ""
    text = re.sub(r'[^\w\s]', '', text)
    return text.strip()

def analyze_sentiment(text):
    """Analyzes text using TextBlob and returns a label and score."""
    cleaned_text = clean_text(text)
    analysis = TextBlob(cleaned_text)
    score = analysis.sentiment.polarity
    
    if score > 0.1:
        return "Positive", score
    elif score < -0.1:
        return "Negative", score
    else:
        return "Neutral", score

def get_driver():
    """Returns a configured Chrome driver with optimized settings."""
    options = Options()
    options.add_argument("--headless=new") # Must be headless for speed
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-images") # Disable images for speed
    options.add_argument("--blink-settings=imagesEnabled=false")
    options.page_load_strategy = 'eager' # Don't wait for full page load

    # Random User Agent
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ]
    options.add_argument(f"user-agent={random.choice(user_agents)}")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    return driver

def scrape_source(source_name, query):
    """Generic wrapper to run a scrape function with its own driver."""
    driver = None
    try:
        driver = get_driver()
        if source_name == "Flipkart":
            return scrape_flipkart(driver, query)
        elif source_name == "Amazon":
            return scrape_amazon(driver, query)
        return []
    except Exception as e:
        print(f"❌ Error in {source_name} thread: {e}")
        return []
    finally:
        if driver:
            driver.quit()

def scrape_flipkart(driver, query):
    """Scrapes Flipkart for reviews."""
    print(f"🛒 [Flipkart] Starting scrape for: {query}")
    try:
        search_url = f"https://www.flipkart.com/search?q={query.replace(' ', '+')}"
        driver.get(search_url)
        
        # Fast fail if no results
        try:
             WebDriverWait(driver, 3).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
             )
        except:
             return []

        # Click first product (Try multiple selectors)
        try:
            first_prod = WebDriverWait(driver, 4).until(
                EC.element_to_be_clickable((By.XPATH, "(//div[@data-id]//a)[1] | (//div[contains(@class, '_1AtVbE')]//a)[1]"))
            )
            product_url = first_prod.get_attribute("href")
            driver.get(product_url)
        except:
            print(f"⚠️ [Flipkart] Product click failed. Scanning search page.")

        # Scrape Reviews
        review_elements = driver.find_elements(By.XPATH, "//div[contains(@class, 'ZmyHeo')] | //div[contains(@class, 't-ZTKy')] | //p[contains(@class, '_2-N8zT')]") 
        if not review_elements:
             review_elements = driver.find_elements(By.XPATH, "//a[@title] | //div[contains(@class, '_4rR01T')]")

        reviews_data = []
        for e in review_elements[:MAX_REVIEWS_PER_SOURCE]:
            text = e.text or e.get_attribute("title")
            if text and len(text) > 10:
                reviews_data.append({"text": text, "source": "Flipkart"})
        
        print(f"✅ [Flipkart] Found {len(reviews_data)} reviews")
        return reviews_data
    except Exception as e:
        print(f"❌ [Flipkart] Error: {e}")
        return []

def scrape_amazon(driver, query):
    """Scrapes Amazon for reviews."""
    print(f"📦 [Amazon] Starting scrape for: {query}")
    try:
        search_url = f"https://www.amazon.in/s?k={query.replace(' ', '+')}"
        driver.get(search_url)
        
        try:
            first_prod = WebDriverWait(driver, 4).until(
                EC.element_to_be_clickable((By.XPATH, "(//div[@data-component-type='s-search-result']//a[contains(@class, 'a-link-normal')])[1]"))
            )
            product_url = first_prod.get_attribute("href")
            driver.get(product_url)
        except:
             print(f"⚠️ [Amazon] Product click failed. Scanning search page.")

        # Scrape Reviews
        review_elements = driver.find_elements(By.XPATH, "//span[@data-hook='review-body'] | //div[@data-hook='review-collapsed'] | //span[contains(@class, 'a-size-base review-text')]")
        if not review_elements:
             review_elements = driver.find_elements(By.XPATH, "//span[contains(@class, 'a-size-medium a-color-base a-text-normal')]")

        reviews_data = []
        for e in review_elements[:MAX_REVIEWS_PER_SOURCE]:
            text = e.text
            if text and len(text) > 10:
                reviews_data.append({"text": text, "source": "Amazon"})
                
        print(f"✅ [Amazon] Found {len(reviews_data)} reviews")
        return reviews_data
    except Exception as e:
        print(f"❌ [Amazon] Error: {e}")
        return []

def check_cache(query):
    """Checks DB for recent reviews of the product."""
    try:
        conn = get_db_connection()
        if not conn: return False
        cur = conn.cursor()
        
        # Check if we have reviews for this product created in last 24 hours
        cur.execute("""
            SELECT COUNT(*) FROM reviews 
            WHERE product_name ILIKE %s 
            AND created_at > NOW() - INTERVAL '24 hours'
        """, (f"%{query}%",))
        
        count = cur.fetchone()[0]
        cur.close()
        conn.close()
        
        return count > 5 # Use cache if we have at least 5 recent reviews
    except Exception as e:
        print(f"Cache check error: {e}")
        return False

def scrape_and_save(query):
    """Main function to control scraping flow."""
    
    # 1. CACHE CHECK
    if check_cache(query):
        print(f"⚡ [CACHE HIT] Found recent data for '{query}'. Skipping scrape.")
        return 0 # 0 new reviews, but successful because data exists
    
    start_time = time.time()
    all_reviews = []

    # 2. PARALLEL SCRAPING
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_flipkart = executor.submit(scrape_source, "Flipkart", query)
        future_amazon = executor.submit(scrape_source, "Amazon", query)
        
        # Wait for both to complete
        for future in concurrent.futures.as_completed([future_flipkart, future_amazon]):
            all_reviews.extend(future.result())

    print(f"📊 Total raw reviews found: {len(all_reviews)} in {time.time() - start_time:.2f}s")

    # 3. SAVE TO DB
    if not all_reviews: return 0

    conn = get_db_connection()
    if not conn: return 0
    cur = conn.cursor()
    processed_count = 0
    
    for item in all_reviews:
        text = item['text']
        source = item['source']
        label, score = analyze_sentiment(text)
        
        try:
            cur.execute(
                "INSERT INTO reviews (review_text, product_name, sentiment_label, sentiment_score, source) VALUES (%s, %s, %s, %s, %s)",
                (text[:1000], query, label, round(score, 3), source)
            )
            processed_count += 1
        except:
            conn.rollback()
    
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"✅ Successfully saved {processed_count} new reviews.")
    return processed_count
