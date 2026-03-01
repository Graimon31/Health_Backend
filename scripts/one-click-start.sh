#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="health-backend:standalone"
CONTAINER_NAME="health-backend"
PORT="${HOST_PORT:-8080}"
VOLUME_NAME="health_backend_data"

JWT_SECRET_VALUE="${JWT_SECRET:-change_this_secret_now}"
ADMIN_EMAIL_VALUE="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD_VALUE="${ADMIN_PASSWORD:-change_me_please}"
ADMIN_FULL_NAME_VALUE="${ADMIN_FULL_NAME:-System Admin}"

echo "[0/5] Cleaning old containers from previous runs..."
docker rm -f "$CONTAINER_NAME" health_nginx health_web health_api health_db >/dev/null 2>&1 || true

echo "[1/5] Building standalone image (fresh build, no cache)..."
docker build --pull --no-cache -f Dockerfile.standalone -t "$IMAGE_NAME" .

echo "[2/5] Starting container on http://localhost:$PORT ..."
docker run -d --name "$CONTAINER_NAME" -p "$PORT:8080" \
  -v "$VOLUME_NAME:/app/data" \
  -e JWT_SECRET="$JWT_SECRET_VALUE" \
  -e ADMIN_EMAIL="$ADMIN_EMAIL_VALUE" \
  -e ADMIN_PASSWORD="$ADMIN_PASSWORD_VALUE" \
  -e ADMIN_FULL_NAME="$ADMIN_FULL_NAME_VALUE" \
  "$IMAGE_NAME" >/dev/null

echo "[3/5] Waiting until service is healthy..."
for i in {1..90}; do
  status="$(docker inspect --format='{{json .State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo '"starting"')"
  if [[ "$status" == '"healthy"' ]]; then
    break
  fi
  sleep 1
done

status="$(docker inspect --format='{{json .State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo '"unavailable"')"
if [[ "$status" != '"healthy"' ]]; then
  echo "❌ Container did not become healthy in time."
  docker logs "$CONTAINER_NAME" --tail 200
  exit 1
fi

echo "[4/5] Verifying that the new dashboard UI is inside container..."
if docker exec "$CONTAINER_NAME" sh -c "grep -q 'Поиск пациентов' /app/static/index.html"; then
  echo "✅ New dashboard build detected."
else
  echo "⚠️ Warning: dashboard marker not found in /app/static/index.html"
fi

echo "[5/5] Done"
echo "✅ Open: http://localhost:$PORT"
echo "✅ API docs: http://localhost:$PORT/api/docs"
