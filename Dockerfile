FROM python:3.11-slim

WORKDIR /app

# Install system libraries for OpenCV and SQLite
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy full application codebase
COPY . .

# Initialize SQLite database and seed initial records
RUN python database.py

# Expose default Hugging Face Spaces port (7860)
EXPOSE 7860

# Run FastAPI backend with Uvicorn
CMD ["uvicorn", "app_api:app", "--host", "0.0.0.0", "--port", "7860"]
