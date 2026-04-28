#!/bin/sh
set -euo pipefail

APP_DIR=/opt/visitas-app

echo "[deploy-script] running in ${APP_DIR}"

if [ -f "${APP_DIR}/.env" ]; then
  echo "[deploy-script] .env found, fixing permissions"
  sudo chown root:root "${APP_DIR}/.env" || true
  sudo chmod 600 "${APP_DIR}/.env" || true
else
  echo "[deploy-script] .env not present, proceeding (ensure DB_* are set if needed)"
fi

cd "${APP_DIR}"

echo "[deploy-script] pulling latest code"
git pull origin main || true

echo "[deploy-script] stopping compose"
sudo docker compose down || true

echo "[deploy-script] starting compose (build)"
sudo docker compose up -d --build

echo "[deploy-script] waiting 15s for services to start"
sleep 15

if ! curl -fsS http://localhost:80/ >/dev/null 2>&1; then
  echo "[deploy-script] health check failed on port 80, printing container logs"
  sudo docker compose logs --tail 300 app || true
  exit 1
fi

echo "[deploy-script] deployment successful"
