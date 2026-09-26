FROM python:3.12-slim AS base

WORKDIR /app

# Install system dependencies (build essentials, curl for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    APP_ENV=production

EXPOSE 8000

# Run FastAPI control plane
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
