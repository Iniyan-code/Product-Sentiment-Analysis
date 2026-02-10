import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# --- DATABASE CONFIGURATION ---
# Replace 'YOUR_PASSWORD' with your actual PostgreSQL password
DB_CONFIG = {
    "host": "localhost",
    "database": "postgres",
    "user": "postgres",
    "password": os.getenv("DB_PASSWORD", "YOUR_PASSWORD") 
}

def get_db_connection():
    """Returns a connection object to the PostgreSQL database."""
    try:
        return psycopg2.connect(**DB_CONFIG)
    except Exception as e:
        print(f"❌ PostgreSQL Connection Error: {e}")
        return None

def init_db():
    """Initializes the database table if it doesn't exist."""
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                product_name TEXT,
                review_text TEXT,
                sentiment_label TEXT,
                sentiment_score FLOAT,
                source TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        # Simple migration for existing table (non-destructive if fails)
        try:
            cur.execute("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS source TEXT;")
        except:
            conn.rollback()
        
        conn.commit()
        cur.close()
        conn.close()
        print("✅ PostgreSQL Table 'reviews' is ready!")

if __name__ == "__main__":
    init_db()