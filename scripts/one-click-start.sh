#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="health-backend:standalone"
CONTAINER_NAME="health-backend"
PORT="8080"
VOLUME_NAME="health_backend_data"

JWT_SECRET_VALUE="${JWT_SECRET:-change_this_secret_now}"
ADMIN_EMAIL_VALUE="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD_VALUE="${ADMIN_PASSWORD:-change_me_please}"
ADMIN_FULL_NAME_VALUE="${ADMIN_FULL_NAME:-System Admin}"

echo "[1/4] Building standalone image..."
docker build -f Dockerfile.standalone -t "$IMAGE_NAME" .

echo "[2/4] Recreating container..."
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

echo "[3/4] Starting container..."
docker run -d --name "$CONTAINER_NAME" -p "$PORT:8080" \
  -v "$VOLUME_NAME:/app/data" \
  -e JWT_SECRET="$JWT_SECRET_VALUE" \
  -e ADMIN_EMAIL="$ADMIN_EMAIL_VALUE" \
  -e ADMIN_PASSWORD="$ADMIN_PASSWORD_VALUE" \
  -e ADMIN_FULL_NAME="$ADMIN_FULL_NAME_VALUE" \
  "$IMAGE_NAME" >/dev/null

echo "[4/4] Waiting until service is healthy..."
for i in {1..90}; do
  status="$(docker inspect --format='{{json .State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo '"starting"')"
  if [[ "$status" == '"healthy"' ]]; then
    echo "✅ Ready: http://localhost:$PORT"
    echo "✅ API docs: http://localhost:$PORT/api/docs"
    exit 0
  fi
  sleep 1
done

echo "❌ Container did not become healthy in time."
docker logs "$CONTAINER_NAME" --tail 200
exit 1
