# 🚀 Deployment Guide: Nexus AI

This guide explains how to deploy **Nexus AI** to the web so you can share it with a link (e.g., `https://nexus-ai.onrender.com`).

Because this application uses **Selenium (Chrome)** and a **Database**, we use **Render.com** which supports Docker containers easily.

## Option 1: Render.com (Recommended)

### 1. Cloud Database (PostgreSQL)
First, you need a database in the cloud.
1.  Go to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **PostgreSQL**.
3.  Name: `nexus-db`.
4.  Region: Pick the one closest to you.
5.  Plan: **Free**.
6.  Click **Create Database**.
7.  **Copy the "Internal Database URL"** (you'll need it later).

### 2. Deploy the Application
1.  Go to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Select **Build and deploy from a Git repository**.
4.  Connect your GitHub account and select the `Product-Sentiment-Analysis` repository.
5.  **Runtime**: Select **Docker**.
6.  **Region**: Same as your database.
7.  **Environment Variables**:
    Add the following variables:
    - `DB_HOST`: *Hostname from your database settings* (e.g., `dpg-xxxx-a`)
    - `DB_NAME`: `nexus_db` (or whatever name you gave it)
    - `DB_USER`: `nexus_user` (from database settings)
    - `DB_PASSWORD`: *The password from database settings*
    - `PYTHON_VERSION`: `3.11.0` (Optional)
    
    *Alternatively, you may just provide a single `DATABASE_URL` if you modify the code to use it, but specific vars are safer for this setup.*

8.  Click **Create Web Service**.

### 3. Wait for Build
Render will now:
1.  Clone your repo.
2.  Build the Docker image (install Chrome, Node, Python).
3.  Start the server.

Once "Live", you will see a link at the top (e.g., `https://nexus-ai.onrender.com`). **Click it to view your live app!**

---

## Troubleshooting

- **Scraping Fails?**: Ensure the Dockerfile successfully installed Chrome. The provided Dockerfile includes `google-chrome-stable`.
- **Database Connection Error?**: Double-check your Environment Variables in Render match the Database credentials exactly.
