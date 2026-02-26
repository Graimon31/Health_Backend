#!/usr/bin/env bash
set -euo pipefail

docker rm -f health-backend >/dev/null 2>&1 || true
echo "Stopped and removed container: health-backend"
