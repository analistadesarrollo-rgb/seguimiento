# Setup - Configuración del Servidor (Una sola vez)

Este documento contiene las instrucciones para configurar el servidor de despliegue. **Se ejecuta UNA sola vez** y luego cada build en Jenkins simplemente hace `git pull + docker restart`.

## Servidor de Despliegue: `seguimiento.serviredgane.cloud`

### 1. Conectarse al servidor

```bash
ssh user@seguimiento.serviredgane.cloud
# o si tienes clave:
ssh -i /path/to/private/key user@seguimiento.serviredgane.cloud
```

### 2. Crear directorio del proyecto (si no existe)

```bash
sudo mkdir -p /opt/visitas-app
sudo chown $(whoami):$(whoami) /opt/visitas-app
cd /opt/visitas-app
```

### 3. Clonar repositorio

```bash
git clone https://github.com/analistadesarrollo-rgb/seguimiento.git .
# o si ya existe y tiene cambios locales:
git pull origin main
```

### 4. Crear archivo `.env` en el servidor (CRÍTICO)

```bash
sudo tee /opt/visitas-app/.env > /dev/null <<'EOF'
DB_HOST=172.20.1.92
DB_USER=cliente
DB_PASS=adminadmon
DB_NAME=appseguimiento
EOF

# Ajustar permisos
sudo chown root:root /opt/visitas-app/.env
sudo chmod 600 /opt/visitas-app/.env

# Verificar que quedó bien
sudo cat /opt/visitas-app/.env
```

### 5. Crear usuario `deploy` (para Jenkins)

```bash
sudo useradd -m -s /bin/bash deploy || true
sudo mkdir -p /home/deploy/.ssh
```

### 6. Añadir clave pública SSH de Jenkins

Si tienes tu clave pública SSH (generada en Jenkins o en tu máquina), pégala:

```bash
sudo tee -a /home/deploy/.ssh/authorized_keys > /dev/null <<'PUB'
ssh-rsa AAAAB3NzaC1yc... (PEGA_AQUI_TU_CLAVE_PUBLICA)
PUB

# Ajustar permisos
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

**Nota:** Si no tienes la clave pública, ejecútala en Jenkins:
```bash
# En el servidor Jenkins, como usuario jenkins
ssh-keygen -t rsa -b 4096 -f /var/lib/jenkins/.ssh/deploy_key -N ""
# Luego copia el contenido de /var/lib/jenkins/.ssh/deploy_key.pub
```

### 7. Permitir a `deploy` ejecutar Docker sin contraseña

**Opción A** (Recomendada - agregar al grupo docker):
```bash
sudo usermod -aG docker deploy
sudo usermod -aG docker root
newgrp docker
```

**Opción B** (Más restrictivo - solo comandos específicos):
```bash
sudo tee /etc/sudoers.d/deploy_docker > /dev/null <<'EOF'
deploy ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose, /bin/mv, /bin/chmod, /bin/chown
EOF
sudo chmod 440 /etc/sudoers.d/deploy_docker
```

### 8. Hacer ejecutable el script de deploy

```bash
sudo chmod +x /opt/visitas-app/scripts/deploy.sh
```

### 9. Verificar que funciona localmente

```bash
# En el servidor, como usuario deploy
cd /opt/visitas-app

# Prueba pull
git pull origin main

# Prueba deploy script (sin sudo para ver si funciona sin contraseña)
docker compose down
docker compose up -d --build
```

Si todo funciona sin errores, tu servidor está listo. 

### 10. (Opcional) Configurar Git para evitar prompts de contraseña

Si `git pull` pide contraseña, configura SSH en el servidor Jenkins o en el servidor deploy:

```bash
# En el servidor deploy, como usuario deploy
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
# Luego añade la clave pública a GitHub Settings > Deploy keys
```

---

## Prueba rápida desde Jenkins

Una vez completado el setup anterior, en Jenkins **no necesitas crear nada** (sin credenciales). Solo:

1. Abre el job "seguimiento"
2. Click **Build Now**
3. Observa el log: debería ver `git pull origin main` y luego `docker compose up`

Si algo falla, pega aquí las últimas líneas del log de Jenkins y las salidas de:
```bash
ssh user@seguimiento.serviredgane.cloud "cd /opt/visitas-app && sudo docker compose logs --tail 200 visitas-app"
```

---

## Resumen: Qué hace cada componente

| Componente | Quién lo configura | Cuándo | Qué hace |
|---|---|---|---|
| `.env` en servidor | Admin/DevOps | **UNA sola vez** | Contiene credenciales DB (no viaja por git) |
| `scripts/deploy.sh` | Git (automático) | Cada deploy | Reinicia Docker Compose y verifica salud |
| Jenkinsfile | Git (automático) | Cada deploy | Hace `git pull` + ejecuta `scripts/deploy.sh` |
| Jenkins credentials | **NADA** (no necesarias) | — | No se necesitan credenciales en Jenkins |

---

## Troubleshooting

**Problema:** "Permission denied (publickey)"
- **Solución:** Asegúrate de que la clave pública está en `/home/deploy/.ssh/authorized_keys` y con permisos `600`.

**Problema:** "env file .env not found"
- **Solución:** Confirma que `/opt/visitas-app/.env` existe: `sudo cat /opt/visitas-app/.env`

**Problema:** "docker: not found" o "permission denied"
- **Solución:** Verifica que `deploy` está en el grupo `docker` o que sudoers permite comandos docker.

**Problema:** "Error de conexión. Intente nuevamente."
- **Solución:** En el servidor: `sudo docker compose logs --tail 200 visitas-app` — copia el error de conexión aquí.
