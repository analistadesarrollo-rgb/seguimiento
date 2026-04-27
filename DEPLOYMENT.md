# 🚀 GUÍA DE DESPLIEGUE: Jenkins + Docker + Nginx + Cloudflare

## 📋 Requisitos Previos

### En tu servidor de producción:
- Docker & Docker Compose instalados
- Jenkins instalado y ejecutándose
- Nginx (ya incluido en docker-compose)
- Acceso SSH configurado
- Certificados SSL (auto-renovable con Let's Encrypt)
- Cuenta en Cloudflare con acceso a API

---

## 🔧 PASO 1: Preparar Jenkins

### 1.1 Crear credenciales en Jenkins

Ir a: **Jenkins → Manage Credentials → System → Global Credentials**

**Crear 3 credenciales:**

1. **docker-credentials** (tipo: Username with password)
   ```
   Username: tu-usuario-docker
   Password: tu-token-docker
   ID: docker-credentials
   ```

2. **github-credentials** (tipo: Username with password)
   ```
   Username: tu-usuario-github
   Password: tu-personal-access-token
   ID: github-credentials
   ```

3. **cloudflare-credentials** (tipo: Secret text)
   ```
   Secret: tu-cloudflare-api-token
   ID: cloudflare-token
   ```

### 1.2 Crear nueva tarea en Jenkins

1. **New Item** → Nombre: `visitas-app-deploy` → Pipeline → OK

2. **Configuración:**
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/tu-usuario/visitas_maps.git`
   - **Credentials**: Seleccionar github-credentials
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile`

3. **Triggers:**
   - ✅ GitHub hook trigger for GITScm polling

4. **Save**

### 1.3 Configurar webhook en GitHub

En tu repositorio GitHub:
1. Settings → Webhooks → Add webhook
2. **Payload URL**: `http://tu-jenkins-server:8080/github-webhook/`
3. **Content type**: `application/json`
4. **Events**: Push events
5. Add webhook

---

## 🐳 PASO 2: Preparar servidor de producción

### 2.1 Crear estructura de directorios

```bash
# En tu servidor
mkdir -p /opt/visitas-app/{storage,ssl,logs,nginx}
cd /opt/visitas-app

# Dar permisos
sudo chown -R deploy:deploy /opt/visitas-app
```

### 2.2 Clonar repositorio

```bash
cd /opt/visitas-app
git clone https://github.com/tu-usuario/visitas_maps.git .
```

### 2.3 Crear archivo .env (si lo necesitas)

```bash
# .env para docker
NODE_ENV=production
PORT=4322
DATABASE_URL=mysql://user:password@db-host:3306/database
```

---

## 🔒 PASO 3: Certificados SSL

### 3.1 Opción A: Let's Encrypt con Certbot (Recomendado)

```bash
# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Generar certificado
sudo certbot certonly --standalone \
    -d visitas.tudominio.com \
    -d www.visitas.tudominio.com \
    --email tu-email@example.com \
    --agree-tos

# Copiar certificados a la carpeta ssl
sudo cp /etc/letsencrypt/live/visitas.tudominio.com/fullchain.pem /opt/visitas-app/ssl/cert.pem
sudo cp /etc/letsencrypt/live/visitas.tudominio.com/privkey.pem /opt/visitas-app/ssl/key.pem
sudo chown deploy:deploy /opt/visitas-app/ssl/*
```

### 3.2 Auto-renovación con crontab

```bash
# Editar crontab
sudo crontab -e

# Añadir esta línea (ejecutar diario a las 3 AM)
0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/visitas.tudominio.com/fullchain.pem /opt/visitas-app/ssl/cert.pem && cp /etc/letsencrypt/live/visitas.tudominio.com/privkey.pem /opt/visitas-app/ssl/key.pem && docker exec visitas-nginx nginx -s reload
```

---

## ☁️ PASO 4: Configurar Cloudflare

### 4.1 Crear API Token en Cloudflare

1. Ir a: **Cloudflare → My Profile → API Tokens**
2. **Create Token** → Custom Token
3. **Permissions:**
   - Zone → DNS → Edit
   - Zone → Zone → Read
4. **Specific Zone Resources**: Seleccionar tu dominio
5. Copiar el token (lo necesitarás en Jenkins)

### 4.2 Obtener IDs necesarios

```bash
# Obtener Zone ID
curl -X GET "https://api.cloudflare.com/client/v4/zones?name=tudominio.com" \
  -H "X-Auth-Email: tu-email@example.com" \
  -H "X-Auth-Key: tu-api-key"

# Obtener Record ID (luego de crear el DNS)
curl -X GET "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records?name=visitas" \
  -H "X-Auth-Email: tu-email@example.com" \
  -H "X-Auth-Key: tu-api-key"
```

### 4.3 Configurar DNS en Cloudflare

1. DNS → Add record
2. **Type**: A
3. **Name**: visitas
4. **IPv4 Address**: IP de tu servidor
5. **Proxied**: ☑️ (naranja)
6. **TTL**: Auto
7. Save

### 4.4 Agregar credenciales a Jenkins

En Jenkins → Manage Credentials:

Crear credencial tipo "Secret text":
```
ID: cloudflare-api-key
Secret: tu-api-token
```

Crear credencial tipo "Username with password":
```
Username: tu-email@cloudflare.com
Password: tu-api-key (globl)
ID: cloudflare-email-key
```

---

## 🏃 PASO 5: Primer Despliegue Manual

```bash
cd /opt/visitas-app

# Construir imagen
docker-compose build

# Iniciar servicios
docker-compose up -d

# Verificar logs
docker-compose logs -f app

# Verificar que esté corriendo
curl -I https://visitas.tudominio.com
```

---

## 📊 Monitoreo y Mantenimiento

### Ver logs de la aplicación
```bash
docker-compose logs -f app
```

### Ver logs de Nginx
```bash
docker-compose logs -f nginx
```

### Reiniciar servicios
```bash
docker-compose restart app
# o
docker-compose down && docker-compose up -d
```

### Limpiar recursos Docker
```bash
docker system prune -a
docker volume prune
```

### Hacer backup de permisos
```bash
cp -r /opt/visitas-app/storage /opt/backups/visitas-storage-$(date +%Y%m%d).bak
```

---

## 🔄 Variables de Entorno en Jenkins

En Jenkins, añadir a "Pipeline" o como "Environment Variables":

```groovy
environment {
    CLOUDFLARE_ZONE_ID = credentials('cloudflare-zone-id')
    CLOUDFLARE_RECORD_ID = credentials('cloudflare-record-id')
    CLOUDFLARE_EMAIL = credentials('cloudflare-email')
    CLOUDFLARE_API_KEY = credentials('cloudflare-api-key')
    SONARQUBE_TOKEN = credentials('sonarqube-token')
}
```

---

## ✅ Checklist Pre-Despliegue

- [ ] Repositorio Git está actualizado
- [ ] Dockerfile construye sin errores
- [ ] Certificados SSL están en `/opt/visitas-app/ssl/`
- [ ] Credenciales configuradas en Jenkins
- [ ] DNS apunta a IP correcta
- [ ] Cloudflare API token funciona
- [ ] Puerto 80 y 443 están abiertos
- [ ] Storage tiene permisos de escritura
- [ ] Database connectionstring es correcta (si aplica)
- [ ] Backups configurados

---

## 🚨 Troubleshooting

### "Connection refused" en Nginx
```bash
# Verificar que app esté corriendo
docker-compose ps

# Verificar logs
docker-compose logs app
```

### Certificado expirado
```bash
# Renovar manualmente
sudo certbot renew --force-renewal
```

### Cloudflare no actualiza DNS
```bash
# Verificar permisos
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer tu-token"
```

### Docker imagen no se actualiza
```bash
docker-compose build --no-cache
docker-compose down
docker-compose up -d
```

---

## 📞 Soporte y Documentación

- Jenkins: http://tu-jenkins-server:8080/
- Cloudflare Docs: https://developers.cloudflare.com/
- Docker Docs: https://docs.docker.com/
- Let's Encrypt: https://letsencrypt.org/

---

**Última actualización**: Abril 2026
**Versión**: 1.0
