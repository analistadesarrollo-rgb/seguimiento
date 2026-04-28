# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=4322

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copiar dist del builder
COPY --from=builder /app/dist ./dist

# Copiar directorio storage para permisos
COPY storage ./storage

# Puerto por defecto
EXPOSE 4322

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4322', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando de inicio
CMD ["node", "dist/server/entry.mjs"]
