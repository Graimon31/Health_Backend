#!/usr/bin/env bash
set -euo pipefail

docker build -f Dockerfile.standalone -t health-backend:standalone .
docker rm -f health-backend >/dev/null 2>&1 || true

docker run -d --name health-backend -p 8080:8080 \
  -e JWT_SECRET="${JWT_SECRET:-change_this_secret}" \
  -e ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}" \
  -e ADMIN_PASSWORD="${ADMIN_PASSWORD:-change_me_please}" \
  health-backend:standalone

echo "Container started: http://localhost:8080"
