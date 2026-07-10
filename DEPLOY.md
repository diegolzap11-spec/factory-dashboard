# Guía de Despliegue - Factory Dashboard

Este documento contiene instrucciones completas para desplegar el Factory Dashboard en diferentes plataformas.

## Prerrequisitos

Antes de desplegar, asegúrate de:

1. Tener Node.js 20+ instalado en tu máquina local
2. Tener pnpm instalado (`npm install -g pnpm`)
3. Haber clonado el repositorio
4. Haber ejecutado `pnpm install` localmente para verificar que todo funciona

## Opción 1: Vercel (Recomendado)

Vercel soporta proyectos monorepo con frontend y backend. Sigue estos pasos:

### Paso 1: Configurar el proyecto en Vercel

1. Ve a https://vercel.com y crea una cuenta (si no tienes una)
2. Conecta tu cuenta de GitHub
3. Haz clic en "Add New..." > "Project"
4. Selecciona el repositorio `factory-dashboard`

### Paso 2: Configurar el build

En la configuración del proyecto en Vercel:

- **Framework Preset**: Other
- **Build Command**: `pnpm build`
- **Output Directory**: `dist/public`
- **Install Command**: `pnpm install`

### Paso 3: Variables de entorno

En Vercel, ve a Settings > Environment Variables y agrega:

```
NODE_ENV=production
PORT=3000
```

### Paso 4: Deploy

Vercel detectará automáticamente el proyecto y lo desplegará. La URL será algo como `https://factory-dashboard.vercel.app`.

**Nota importante**: Vercel no soporta SQLite persistente porque cada request corre en un serverless function. Para despliegue en Vercel, necesitas usar una base de datos externa. Ver la sección "Alternativas para Vercel" más abajo.

## Opción 2: Railway (Recomendado para SQLite)

Railway permite ejecutar servidores Node.js con archivos locales persistentes (incluyendo SQLite).

### Paso 1: Crear proyecto en Railway

1. Ve a https://railway.app y crea una cuenta
2. Haz clic en "New Project" > "Deploy from GitHub repo"
3. Selecciona `factory-dashboard`

### Paso 2: Configurar

Railway detectará automáticamente el proyecto. Configura:

- **Build Command**: `pnpm build`
- **Start Command**: `pnpm start`
- **Root Directory**: `/`

### Paso 3: Variables de entorno

En Railway > Variables:

```
NODE_ENV=production
PORT=$PORT
```

### Paso 4: Deploy

Railway construirá y desplegará automáticamente. La URL será `https://factory-dashboard.railway.app`.

**Ventaja**: Railway mantiene el sistema de archivos, por lo que SQLite funciona perfectamente y los datos persisten entre deploys.

## Opción 3: Render

### Paso 1: Crear servicio

1. Ve a https://render.com y crea una cuenta
2. Haz clic en "New +" > "Web Service"
3. Conecta tu repositorio GitHub

### Paso 2: Configurar

- **Build Command**: `pnpm build`
- **Start Command**: `pnpm start`
- **Environment**: Node

### Paso 3: Variables

- `NODE_ENV=production`

### Paso 4: Deploy

Render desplegará automáticamente. La URL será `https://factory-dashboard.onrender.com`.

## Opción 4: Self-hosted (Servidor propio / VPS)

Para desplegar en un servidor propio (DigitalOcean, AWS EC2, Hetzner, etc.):

### Paso 1: Preparar el servidor

```bash
# Instalar Node.js y pnpm
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
npm install -g pnpm

# Crear directorio
sudo mkdir -p /opt/factory-dashboard
sudo chown $USER:$USER /opt/factory-dashboard
```

### Paso 2: Clonar y configurar

```bash
cd /opt/factory-dashboard
git clone https://github.com/diegolzap11-spec/factory-dashboard.git .
pnpm install
cp .env.example .env
```

### Paso 3: Inicializar base de datos

```bash
pnpm db:push
```

### Paso 4: Generar build de producción

```bash
pnpm build
```

### Paso 5: Ejecutar con PM2 (recomendado)

```bash
npm install -g pm2
pm2 start dist/index.js --name factory-dashboard
pm2 save
pm2 startup
```

### Paso 6: Configurar Nginx como reverse proxy

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Actualizar después de cambios

Cuando hagas cambios al código:

```bash
# 1. Hacer commit y push a GitHub
git add .
git commit -m "Descripción del cambio"
git push origin main

# 2. Si usas Railway/Render/Vercel: el deploy es automático
# 3. Si usas self-hosted:
cd /opt/factory-dashboard
git pull origin main
pnpm install
pnpm db:push  # si hubo cambios en el schema
pnpm build
pm2 restart factory-dashboard
```

## Solución de problemas

### Error: better-sqlite3 no compila

```bash
# Instalar dependencias del sistema
sudo apt-get install -y python3 make g++ build-essential

# Rebuild
pnpm rebuild better-sqlite3
```

### Error: Tablas no existen

```bash
pnpm db:push
```

### Error: Port already in use

```bash
# Cambiar el puerto en .env
PORT=3001
```

### Datos no persisten en Railway/Vercel

SQLite requiere un sistema de archivos persistente. Si los datos se pierden:

- **Railway**: Asegúrate de que el volumen persistente está activado
- **Vercel**: Cambia a una base de datos como MySQL/PostgreSQL (no soportado actualmente en este proyecto)

## Arquitectura de Despliegue

```
                    ┌─────────────────┐
                    │    Usuario       │
                    │   (Browser)      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  HTTPS (443)    │
                    │  Nginx / CDN    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Express Server  │
                    │  :3000          │
                    │                 │
                    │  /trpc (API)    │
                    │  / (Frontend)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  SQLite         │
                    │  database.db    │
                    └─────────────────┘
```
