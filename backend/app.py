from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_db_connection, init_db
from scraper import scrape_and_save

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
# Enable CORS (still useful for development or if separate)
CORS(app)

@app.route('/')
def serve():
    return app.send_static_file('index.html')

@app.route('/api/status', methods=['GET'])
def check_status():
    """Endpoint to check if the backend is alive."""
    return jsonify({"message": "Backend is live and connected!"})

import pandas as pd
import numpy as np

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Provides product review insights and business intelligence statistics."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        # Load data into Pandas DataFrame for analysis
        df = pd.read_sql("SELECT * FROM reviews", conn)
        conn.close()
        
        if df.empty:
            return jsonify({"message": "No data available for analysis"})

        # Business Intelligence & Data-Driven Reports
        stats = {
            "total_reviews": int(df.shape[0]),
            "average_sentiment": float(round(df['sentiment_score'].mean(), 2)),
            "sentiment_distribution": df['sentiment_label'].value_counts().to_dict(),
            "trending_products": df['product_name'].value_counts().head(5).to_dict(),
            "volatility": float(round(df['sentiment_score'].std(), 2)) if len(df) > 1 else 0
        }
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data', methods=['GET'])
def get_all_data():
    """Fetches all analyzed product records from the database."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        # Fetch latest records first
        cur.execute("SELECT product_name, review_text, sentiment_label, sentiment_score, source FROM reviews ORDER BY created_at DESC")
        rows = cur.fetchall()
        
        data = [{"product": r[0], "review": r[1], "sentiment": r[2], "score": r[3], "source": r[4]} for r in rows]
        
        cur.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scrape', methods=['POST'])
def trigger_scrape():
    """Receives a search query and triggers the Selenium scraper."""
    payload = request.json
    query = payload.get('query')
    
    if not query:
        return jsonify({"error": "Query parameter missing"}), 400
    
    try:
        new_items_count = scrape_and_save(query)
        return jsonify({
            "message": "Scrape completed successfully",
            "items_added": new_items_count
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Ensure database is ready before starting server
    init_db()
    print("🚀 Flask Server starting on http://localhost:5000")
    app.run(debug=True, port=5000)