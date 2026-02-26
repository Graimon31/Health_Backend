#!/bin/bash
set -e

# Wait for DB
until nc -z db 5432; do
  echo "Waiting for DB..."
  sleep 2
done

# Run migrations
alembic upgrade head

# Start app
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
