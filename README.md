# Nexus AI - Next-Gen Market Intelligence

**Nexus AI** (formerly Product Sentiment Analyzer) is a cutting-edge web application that delivers real-time market insights by scraping and analyzing product reviews from major E-commerce platforms (Amazon, Flipkart). It features a professional dark/light themed dashboard, advanced sentiment analytics, and high-performance concurrent scraping.

## 🚀 Features

-   **Multi-Platform Concurrent Scraping**:
    -   Scrapes **Amazon** and **Flipkart** simultaneously using parallel threads for 2x speed.
    -   **Smart Caching**: Checks the database for recent analyses (24h) to provide instant results.
    -   **Stealth Mode**: Optimized Selenium driver with anti-detection and eager loading.
-   **Advanced Sentiment Analysis**:
    -   NLP-powered classification (Positive, Neutral, Negative) with precise polarity scores.
    -   **Trend Analysis**: Visualizes sentiment trends over time with multi-line area charts.
-   **Professional Dashboard**:
    -   **Nexus UI**: A premium, responsive interface with **Dark Mode** (Green/Red/Orange theme) and **High-Contrast Light Mode**.
    -   **Metric Cards**: Key performance indicators (Avg Rating, Sentiment Distribution) with simulated growth trends.
    -   **Interactive Charts**: Donut charts for distribution and Area charts for volume trends.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide React
-   **Backend**: Flask (Python), Selenium (Headless), TextBlob (NLP), PostgreSQL
-   **Database**: PostgreSQL

## 📋 Prerequisites

-   Python 3.9+
-   Node.js 16+
-   PostgreSQL installed and running
-   Google Chrome (latest version)

## ⚡ Installation & Setup

### 1. Database Setup
Ensure PostgreSQL is running. The app uses the default `postgres` user/database (configurable in `backend/database.py`).
```bash
# Ensure the 'postgres' service is active
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Activate Venv:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt

# Create .env file (Optional, defaults to 'YOUR_PASSWORD')
echo DB_PASSWORD=your_db_password > .env
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## 🏃 Running the Application

### Start Backend
```bash
cd backend
# Use 'py' or 'python' depending on your OS
py app.py 
# Server starts at http://localhost:5000
```

### Start Frontend
```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

## 🎮 Usage
1.  Open **Nexus AI** at `http://localhost:5173`.
2.  Toggle **Dark/Light Mode** using the icon in the top right.
3.  Enter a product (e.g., "Sony WH-1000XM5") and click search.
4.  Watch the real-time analysis status (Scraping Amazon/Flipkart...).
5.  View the **Intelligence Report**:
    -   **Metric Cards**: Snapshot of total reviews and ratings.
    -   **Sentiment Trends**: How sentiment has changed over time.
    -   **Recent Reviews**: Filterable feed of individual review cards.

## 📦 Deployment Notes
-   **Selenium**: Requires a VPS/Docker environment with Chrome installed.
-   **Render/Heroku**: Free tiers may struggle with headless Chrome. Use a custom Dockerfile with Chrome installed for best results.

## License
MIT
