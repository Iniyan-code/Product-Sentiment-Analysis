# Product Sentiment Analyzer & Review Dashboard

A comprehensive web application that scrapes product reviews from E-commerce platforms (Amazon, Flipkart), analyzes their sentiment using NLP, and visualizes the data on an interactive dashboard.

## Features
- **Multi-Platform Scraping**: Dynamic scraping of Amazon and Flipkart using Selenium.
- **Sentiment Analysis**: NLP-powered classification (Positive, Neutral, Negative) with polarity scores.
- **Interactive Dashboard**: React-based UI with charts, search history, and detailed review logs.
- **Data Persistence**: PostgreSQL database to store and retrieve analysis history.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide React
- **Backend**: Flask, Python, Selenium, TextBlob, PostgreSQL
- **Database**: PostgreSQL

## prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL installed and running
- Google Chrome (for Selenium)

## Installation & Setup

### 1. Database Setup
Ensure PostgreSQL is running. Create a database (default is `postgres` user/pass, configurable in `backend/.env`).
```bash
# Optional: Create a specific database if not using default "postgres"
createdb sentiment_db
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
# source venv/bin/activate

pip install -r requirements.txt

# Create .env file
echo DB_PASSWORD=your_db_password > .env
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## Running the Application

### Start Backend
```bash
cd backend
python app.py
# Server starts at http://localhost:5000
```

### Start Frontend
```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

## Usage
1. Open the frontend URL.
2. Enter a product name (e.g., "iPhone 15", "Nike Shoes") in the search bar.
3. Click "Analyze".
4. Wait for the scraper to collect reviews (approx. 10-20 seconds).
5. View the sentiment distribution and detailed review logs.

## Deployment Notes
- **Selenium**: This project uses Selenium which requires a browser environment.
  - **Docker/VPS**: Recommended for deployment. You need to install Chrome/Chromium in the container.
  - **Render/Heroku**: Free tiers often block scraping or lack resources for headless Chrome. Implementation generally requires buildpacks for Chrome.

## License
MIT
