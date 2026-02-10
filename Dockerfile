# --- Stage 1: Build Frontend ---
FROM node:18-alpine as build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Setup Backend with Chrome ---
FROM python:3.11-slim

# Install system dependencies for Chrome and Python
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    libnss3 \
    libgconf-2-4 \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome (Stable) - Updated method
RUN wget -q -O /tmp/google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && apt-get update \
    && apt-get install -y /tmp/google-chrome.deb \
    && rm /tmp/google-chrome.deb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Copy backend requirements and install
COPY backend/requirements.txt .
# Remove version constraints from requirements for compatibility if needed, 
# but Docker environment is controlled so we can use standard pip.
# We'll install strictly from the file.
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy built frontend from Stage 1
COPY --from=build-frontend /app/frontend/dist /app/frontend/dist

# Expose port
EXPOSE 5000

# Environment variables (Defaults, override in deployment)
ENV PORT=5000
ENV DB_HOST=localhost
ENV DB_NAME=postgres
ENV DB_USER=postgres
ENV DB_PASSWORD=password

# Run the application
# Using gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "app:app"]
