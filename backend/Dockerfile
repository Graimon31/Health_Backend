# Dockerfile for Backend (API)

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (netcat for wait-for-it)
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .
RUN chmod +x entrypoint.sh

# Expose API port
EXPOSE 8000

# Command to run (can be overridden by docker-compose)
CMD ["./entrypoint.sh"]
