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

# Install Google Chrome (Stable)
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
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
