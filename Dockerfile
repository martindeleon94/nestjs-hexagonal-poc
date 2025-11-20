# ============================================
# STAGE 1: Dependencies
# ============================================
# Instalación de dependencias
FROM node:22-alpine AS dependencies

# Metadata
LABEL maintainer="your-email@example.com"
LABEL description="NestJS Hexagonal Architecture - Dependencies Stage"

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
# Solo copiamos package*.json para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias de producción
# --omit=dev: No instala devDependencies
# --frozen-lockfile: Usa exactamente las versiones de package-lock.json
RUN npm ci --omit=dev --frozen-lockfile

# Copiar todo el package-lock para la siguiente etapa
COPY package-lock.json ./

# ============================================
# STAGE 2: Build
# ============================================
# Compilación del proyecto TypeScript
FROM node:22-alpine AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo dev)
# Necesarias para compilar TypeScript
RUN npm ci --frozen-lockfile

# Copiar código fuente
COPY . .

# Generar cliente de Prisma
# DATABASE_URL no es necesaria para generar el cliente, solo para migraciones
# Usamos un valor dummy para que Prisma genere el cliente
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

# Compilar TypeScript a JavaScript
RUN npm run build

# Limpiar devDependencies después del build
RUN npm prune --omit=dev

# ============================================
# STAGE 3: Production
# ============================================
# Imagen final de producción (la más ligera)
FROM node:22-alpine AS production

# Metadata
LABEL maintainer="your-email@example.com"
LABEL description="NestJS Hexagonal Architecture - Production"
LABEL version="1.0.0"

# Instalar dumb-init (manejo correcto de señales)
RUN apk add --no-cache dumb-init

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copiar node_modules desde dependencies stage
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copiar código compilado desde build stage
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist

# Copiar archivos necesarios
COPY --chown=nestjs:nodejs package*.json ./

# Copiar Prisma schema y cliente generado
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copiar script de inicio con migraciones
COPY --chown=nestjs:nodejs scripts/docker-entrypoint.sh ./scripts/
RUN chmod +x ./scripts/docker-entrypoint.sh

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Usar script de inicio que ejecuta migraciones
CMD ["./scripts/docker-entrypoint.sh"]
