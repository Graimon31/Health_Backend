#!/usr/bin/env bash
set -e

# Change to project root if running from scripts/
if [[ -f "../docker-compose.yml" ]]; then
  cd ..
fi

echo "🚀 Starting Health Service One-Click Setup..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker Desktop first."
    exit 1
fi

# Create .env if missing
if [[ ! -f .env ]]; then
  echo "📄 Creating .env file from example..."
  cp .env.example .env
fi

# Build and Start
echo "🐳 Building and starting containers..."
docker compose up --build -d

echo "⏳ Waiting for services to become healthy..."

# Wait for backend health (basic check)
# Loop up to 30 times (30 * 2s = 60s)
for i in {1..30}; do
  if curl -s http://localhost:8080/api/v1/health | grep "OK" > /dev/null; then
    echo "✅ Backend is healthy!"
    break
  fi
  echo "   Waiting for API... ($i/30)"
  sleep 2
done

echo ""
echo "🎉 All systems GO!"
echo "---------------------------------------------------"
echo "🌐 Frontend Panel:  http://localhost:8080"
echo "📚 API Docs:        http://localhost:8080/api/docs"
echo "---------------------------------------------------"
echo "To stop: docker compose down"
