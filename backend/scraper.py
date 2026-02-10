import time
import random
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
    score = analysis.sentiment.polarity  # Returns value between -1.0 and 1.0
    
    if score > 0.1:
        return "Positive", score
    elif score < -0.1:
        return "Negative", score
    else:
        return "Neutral", score

def get_driver():
    """Returns a configured Chrome driver with anti-detection options."""
    options = Options()
    
    # Headless mode for server environments, but can be commented out for debugging
    options.add_argument("--headless=new")
    
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    
    # Random User Agent Rotation (Simple List)
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0"
    ]
    options.add_argument(f"user-agent={random.choice(user_agents)}")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    # Execute CDP commands to hide automation flags
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": """
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            })
        """
    })
    
    return driver

def scrape_flipkart(driver, query):
    """Scrapes Flipkart for reviews."""
    print(f"🛒 Scraping Flipkart for: {query}")
    try:
        search_url = f"https://www.flipkart.com/search?q={query.replace(' ', '+')}"
        driver.get(search_url)
        time.sleep(random.uniform(2, 4))
        
        # Click first product
        try:
            # Try multiple selectors for product link
            first_prod = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, "(//div[@data-id]//a)[1] | (//div[contains(@class, '_1AtVbE')]//a)[1]"))
            )
            product_url = first_prod.get_attribute("href")
            driver.get(product_url)
            time.sleep(random.uniform(2, 4))
        except Exception as e:
            print(f"⚠️ Flipkart product click failed: {e}. Attempting to scrape search results directly.")
        
        # Scrape Reviews
        review_elements = driver.find_elements(By.XPATH, "//div[contains(@class, 'ZmyHeo')] | //div[contains(@class, 't-ZTKy')] | //p[contains(@class, '_2-N8zT')]") 
        
        # Fallback to product titles if on search page
        if not review_elements:
             review_elements = driver.find_elements(By.XPATH, "//a[@title] | //div[contains(@class, '_4rR01T')]")

        reviews_data = []
        for e in review_elements[:15]: # Limit to 15 for speed
            text = e.text or e.get_attribute("title")
            if text and len(text) > 10:
                reviews_data.append(text)
        
        return reviews_data
    except Exception as e:
        print(f"❌ Flipkart Scrape Error: {e}")
        return []

def scrape_amazon(driver, query):
    """Scrapes Amazon for reviews."""
    print(f"📦 Scraping Amazon for: {query}")
    try:
        search_url = f"https://www.amazon.in/s?k={query.replace(' ', '+')}"
        driver.get(search_url)
        time.sleep(random.uniform(2, 4))
        
        # Click first product
        try:
            first_prod = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, "(//div[@data-component-type='s-search-result']//a[contains(@class, 'a-link-normal')])[1]"))
            )
            product_url = first_prod.get_attribute("href")
            driver.get(product_url)
            time.sleep(random.uniform(2, 4))
        except Exception as e:
            print(f"⚠️ Amazon product click failed: {e}. Attempting fallback.")

        # Scrape Reviews
        # Amazon review text is often in data-hook="review-body"
        review_elements = driver.find_elements(By.XPATH, "//span[@data-hook='review-body'] | //div[@data-hook='review-collapsed'] | //span[contains(@class, 'a-size-base review-text')]")
        
        # Fallback to titles if no reviews found
        if not review_elements:
             review_elements = driver.find_elements(By.XPATH, "//span[contains(@class, 'a-size-medium a-color-base a-text-normal')]")

        reviews_data = []
        for e in review_elements[:15]:
            text = e.text
            if text and len(text) > 10:
                reviews_data.append(text)
                
        return reviews_data

    except Exception as e:
        print(f"❌ Amazon Scrape Error: {e}")
        return []

def scrape_and_save(query):
    """Main function to control scraping flow."""
    driver = get_driver()
    processed_count = 0
    
    try:
        # Scrape both platforms
        flipkart_reviews = scrape_flipkart(driver, query)
        amazon_reviews = scrape_amazon(driver, query)
        
        # Combine with source tags
        all_reviews = []
        for r in flipkart_reviews:
            all_reviews.append({"text": r, "source": "Flipkart"})
        for r in amazon_reviews:
            all_reviews.append({"text": r, "source": "Amazon"})
            
        print(f"📊 Total raw reviews found: {len(all_reviews)}")

        conn = get_db_connection()
        if not conn: return 0
        cur = conn.cursor()
        
        for item in all_reviews:
            text = item['text']
            source = item['source']
            
            # Analyze sentiment
            label, score = analyze_sentiment(text)
            
            try:
                # Insert review
                cur.execute(
                    "INSERT INTO reviews (review_text, product_name, sentiment_label, sentiment_score, source) VALUES (%s, %s, %s, %s, %s)",
                    (text[:1000], query, label, round(score, 3), source)
                )
                processed_count += 1
            except Exception as db_err:
                print(f"Database error: {db_err}")
                conn.rollback()
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"✅ Successfully saved {processed_count} reviews to DB.")
        return processed_count
    
    except Exception as e:
        print(f"❌ General Scraper Failure: {e}")
        return 0
    finally:
        driver.quit()
