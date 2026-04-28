# Setup - Configuración Mínima del Servidor (UNA VEZ)

Este documento contiene la configuración mínima necesaria en el servidor. **Jenkins hace AUTOMÁTICAMENTE el resto en el primer deploy.**

## Resumen rápido

El flujo es:
1. **Primera vez**: Jenkins ejecuta `scripts/setup-remote.sh` (crea directorios, clona repo, configura permisos)
2. **Luego**: Jenkins ejecuta `scripts/deploy.sh` (restart de Docker)
3. **En adelante**: Jenkins solo hace `git pull + deploy.sh` en cada build

**Tú solo necesitas asegurar una cosa en el servidor**: que Jenkins puede hacer SSH sin contraseña.

---

## Servidor de Despliegue: `seguimiento.serviredgane.cloud`

### Paso 1: Conectar al servidor

```bash
ssh tu-usuario@seguimiento.serviredgane.cloud
```

### Paso 2: Crear usuario `deploy`

```bash
sudo useradd -m -s /bin/bash deploy || true
sudo mkdir -p /home/deploy/.ssh
```

### Paso 3: Añadir clave SSH pública de Jenkins

Obtén tu clave pública SSH (generada en Jenkins o tu máquina):

```bash
# Si la generaste con ssh-keygen, copia el contenido de ~/.ssh/id_rsa.pub
# Si Jenkins la generó, copia /var/lib/jenkins/.ssh/deploy_key.pub
```

Luego en el servidor:

```bash
sudo tee -a /home/deploy/.ssh/authorized_keys > /dev/null <<'PUB'
ssh-rsa AAAAB3NzaC1yc... (PEGA_AQUI_TU_CLAVE_PUBLICA)
PUB

# Ajustar permisos
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

### Paso 4: Permitir a `deploy` ejecutar Docker sin contraseña

**Opción A** (recomendada):
```bash
sudo usermod -aG docker deploy
```

**Opción B** (más restrictivo):
```bash
sudo tee /etc/sudoers.d/deploy_docker > /dev/null <<'EOF'
deploy ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose, /bin/mv, /bin/chmod, /bin/chown
EOF
sudo chmod 440 /etc/sudoers.d/deploy_docker
```

### Paso 5: Listo ✅

Eso es todo. El servidor está listo. Jenkins se encargará de:
- ✅ Clonar el repo
- ✅ Crear el archivo `.env`
- ✅ Levantar Docker Compose

---

## Qué hace Jenkins automáticamente

| Tarea | Cuándo | Script |
|---|---|---|
| Clonar repo | **Primer deploy** | `scripts/setup-remote.sh` |
| Crear `.env` | **Primer deploy** | `scripts/setup-remote.sh` |
| Permisos | **Primer deploy** | `scripts/setup-remote.sh` |
| Git pull + Docker restart | **Cada deploy** | `scripts/deploy.sh` |

---

## Troubleshooting

**Error: "Permission denied (publickey)"**
- Verifica que la clave pública está en `/home/deploy/.ssh/authorized_keys`
- Verifica permisos: `sudo ls -la /home/deploy/.ssh/`

**Error: "docker: not found"** o **"Permission denied"**
- Verifica que `deploy` está en el grupo docker: `groups deploy`
- O que sudoers permite docker: `sudo cat /etc/sudoers.d/deploy_docker`

**Error: "env file .env not found"**
- Jenkins creó el `.env` en el primer deploy
- Verifica: `sudo cat /opt/visitas-app/.env`

**Error de conexión a BD**
- Verifica el contenido del `.env`: `sudo cat /opt/visitas-app/.env`
- Prueba conexión: `mysql -h 172.20.1.92 -u cliente -padminadmon -e "SELECT 1"`
- O con Docker: `sudo docker run --rm mysql:5.7 mysql -h 172.20.1.92 -u cliente -padminadmon -e "SELECT 1"`
