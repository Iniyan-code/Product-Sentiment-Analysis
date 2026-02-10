from scraper import scrape_and_save

if __name__ == "__main__":
    print("Testing Scraper...")
    query = "wireless earbuds"
    count = scrape_and_save(query)
    print(f"Test Completed. Items added: {count}")
