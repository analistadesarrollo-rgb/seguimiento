#!/bin/sh
set -euo pipefail

APP_DIR=/opt/visitas-app

echo "[deploy-script] running in ${APP_DIR}"

# Asegurar que .env existe y tiene los valores correctos
echo "[deploy-script] ensuring .env is configured"
sudo tee ${APP_DIR}/.env > /dev/null <<'EOF'
DB_HOST=172.20.1.92
DB_USER=cliente
DB_PASS=adminadmon
DB_NAME=appseguimiento
EOF

sudo chown root:root ${APP_DIR}/.env
sudo chmod 600 ${APP_DIR}/.env

cd ${APP_DIR}

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
