from database import get_db_connection, init_db

def reset_db():
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("DROP TABLE IF EXISTS reviews;")
            conn.commit()
            print("✅ Dropped table 'reviews'.")
        except Exception as e:
            print(f"❌ Error dropping table: {e}")
        finally:
            cur.close()
            conn.close()
    
    init_db()

if __name__ == "__main__":
    reset_db()
