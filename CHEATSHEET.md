# 🚀 CHEAT SHEET: Jenkins + Docker + Nginx + Cloudflare

## 📋 COMANDOS RÁPIDOS

### Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver estado
docker-compose ps

# Logs en tiempo real
docker-compose logs -f app
docker-compose logs -f nginx

# Reiniciar un servicio
docker-compose restart app

# Reconstruir imagen
docker-compose build --no-cache

# Ejecutar comando en contenedor
docker-compose exec app npm run build
```

### Nginx

```bash
# Probar configuración
docker exec visitas-nginx nginx -t

# Recargar configuración sin reiniciar
docker exec visitas-nginx nginx -s reload

# Ver logs de acceso
docker-compose logs nginx
```

### Base de datos (si aplica)

```bash
# Conectar a MySQL
docker-compose exec db mysql -u usuario -p database

# Hacer backup
mysqldump -u usuario -p database > backup.sql
```

### SSL/Certificados

```bash
# Ver fecha de expiración
openssl x509 -in /opt/visitas-app/ssl/cert.pem -noout -dates

# Renovar Let's Encrypt
sudo certbot renew --force-renewal

# Verificar que Nginx lea bien el certificado
docker exec visitas-nginx openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout
```

### Jenkins

```bash
# Trigger manual de un build
curl -X POST http://jenkins-server:8080/job/visitas-app-deploy/build \
  -H "Authorization: Bearer TOKEN"

# Ver logs del último build
curl http://jenkins-server:8080/job/visitas-app-deploy/lastBuild/consoleText
```

### Cloudflare

```bash
# Obtener todos los DNS records
curl -X GET "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records" \
  -H "Authorization: Bearer TOKEN"

# Crear un DNS record
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"A","name":"visitas","content":"192.168.1.100","proxied":true}'

# Actualizar DNS record
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records/RECORD_ID" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"content":"192.168.1.101"}'

# Limpiar caché de Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

## 🔍 DEBUGGING

### La app no responde

```bash
# 1. Verificar si el contenedor está corriendo
docker-compose ps

# 2. Ver logs detallados
docker-compose logs app -n 100

# 3. Conectar al contenedor
docker-compose exec app sh

# 4. Verificar puerto 4322
netstat -tuln | grep 4322
```

### Nginx no redirige tráfico

```bash
# 1. Verificar configuración
docker exec visitas-nginx nginx -t

# 2. Ver logs de Nginx
docker-compose logs nginx

# 3. Verificar conectividad a app
docker-compose exec nginx curl http://app:4322

# 4. Probar desde fuera
curl -v https://visitas.tudominio.com
```

### Certificado no se renueva

```bash
# 1. Ver último intento
sudo journalctl -u certbot -n 50

# 2. Renovar manualmente
sudo certbot renew --verbose

# 3. Verificar permisos
ls -la /etc/letsencrypt/live/visitas.tudominio.com/
```

### DNS de Cloudflare no funciona

```bash
# 1. Verificar si apunta a IP correcta
nslookup visitas.tudominio.com 1.1.1.1

# 2. Verificar TTL
dig visitas.tudominio.com +nocmd +noall +answer

# 3. Limpiar caché
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://visitas.tudominio.com/*"]}'
```

---

## 📊 MONITOREO

### Recursos en tiempo real

```bash
# CPU y memoria
docker stats visitas-app

# Espacio en disco
df -h
du -sh /opt/visitas-app/*
```

### Health checks

```bash
# Verificar aplicación
curl -s https://visitas.tudominio.com/api/supervisores | jq

# Verificar Nginx
curl -s -I https://visitas.tudominio.com | head -5

# Verificar SSL
curl -v https://visitas.tudominio.com 2>&1 | grep "SSL"
```

---

## 🔄 DESPLIEGUES Y ROLLBACK

### Despliegue rápido

```bash
cd /opt/visitas-app
git pull origin main
docker-compose build --no-cache
docker-compose down
docker-compose up -d
```

### Rollback a versión anterior

```bash
cd /opt/visitas-app

# Ver historial de imágenes
docker images | grep visitas-app

# Rollback a una versión anterior
docker-compose down
# Editar docker-compose.yml para usar TAG anterior
# Luego:
docker-compose up -d
```

### Canary deployment (Deploy gradual)

```bash
# 1. Mantener 2 instancias de app en docker-compose
# 2. Cambiar nginx para balancear entre ellas
# 3. Actualizar una, probar, luego actualizar la otra
upstream visitas_app {
    server app1:4322;
    server app2:4322;
}
```

---

## 🔐 SEGURIDAD

### Cambiar contraseña de BD (si aplica)

```bash
ALTER USER 'usuario'@'localhost' IDENTIFIED BY 'nueva-contraseña';
```

### Verificar vulnerabilidades Docker

```bash
# Escanear imagen
docker run --rm aquasec/trivy image tu-usuario/visitas-app:latest
```

### Actualizar imágenes base

```bash
# Verificar actualizaciones disponibles
docker pull node:18-alpine

# Reconstruir
docker-compose build --no-cache --pull
```

---

## 📈 PERFORMANCE

### Habilitar compresión en Nginx

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### Caché de navegador (Cloudflare)

```bash
# Configurar en Cloudflare Dashboard:
# Caching Level: Standard
# Browser Cache TTL: 4 hours (mínimo)
# Cache on Upload: ON
```

### CDN de assets

```nginx
# En nginx.conf, los assets estáticos se cachean 1 año
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

---

## 📞 CONTACTOS Y LINKS

- **Jenkins**: http://jenkins:8080/
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **Docker Hub**: https://hub.docker.com/
- **Let's Encrypt**: https://letsencrypt.org/
- **Nginx Docs**: https://nginx.org/en/docs/

---

**Última actualización**: Abril 2026
**Versión**: 1.0
