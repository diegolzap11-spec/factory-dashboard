# Flexo Impress - Sistema de Gestión de Producción e Inventario

Sistema de dashboard para la gestión de producción, stock, despachos e insumos de la fábrica Flexo Impress. Diseñado con una interfaz moderna, oscura y premium, completamente independiente y lista para producción.

## Características

- **Dashboard Principal**: Vista general con KPIs de stock, producción, despachos e insumos
- **Gestión de Stock**: Control de inventario por tipo de producto y color
- **Producción**: Registro diario de producción con actualización automática de stock
- **Despachos**: Control de salidas de productos con validación de stock disponible
- **Insumos**: Gestión de materia prima por categorías (alta/baja calidad)
- **Consumo**: Registro de consumo de insumos (bolsas de 25kg) con descontaje automático
- **Reportes**: Visualización de datos por rangos de fecha con gráficos interactivos
- **Configuración**: Ajustes del sistema y visualización de información

## Tecnologías

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS 4
- **Backend**: Express.js + tRPC + Zod
- **Base de Datos**: SQLite (better-sqlite3 + Drizzle ORM)
- **UI Components**: Radix UI + shadcn/ui
- **Gráficos**: Recharts
- **Notificaciones**: Sonner
- **Animaciones**: Framer Motion

## Requisitos

- Node.js 20+ (recomendado 22+)
- pnpm (recomendado) o npm/yarn
- Sistema operativo: Linux, macOS o Windows

## Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/diegolzap11-spec/factory-dashboard.git
cd factory-dashboard

# 2. Instalar dependencias
pnpm install
# o si usas npm: npm install
# Nota: Si usas npm, asegúrate de compilar better-sqlite3 manualmente:
# npm rebuild better-sqlite3

# 3. Configurar variables de entorno (opcional, usa valores por defecto)
cp .env.example .env

# 4. Inicializar la base de datos
pnpm db:push

# 5. Ejecutar en modo desarrollo
pnpm dev
```

El servidor se ejecutará en `http://localhost:3000` con hot-reload del frontend.

## Generar Build de Producción

```bash
pnpm build
```

Esto generará:
- `dist/public/` - Frontend estático (React build)
- `dist/index.js` - Servidor Express compilado

## Ejecutar en Producción

```bash
pnpm start
```

El servidor servirá el frontend estático desde `dist/public/` y la API desde `/trpc`.

## Estructura del Proyecto

```
factory-dashboard/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes UI (shadcn/ui)
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── lib/            # Utilidades y trpc client
│   │   ├── pages/          # Páginas principales
│   │   ├── App.tsx         # Routing
│   │   ├── main.tsx        # Entry point
│   │   ├── const.ts        # Configuración global
│   │   └── index.css       # Estilos globales
│   ├── public/             # Assets estáticos (imágenes)
│   └── index.html          # HTML template
├── server/                 # Backend Express + tRPC
│   ├── db.ts               # Lógica de base de datos
│   ├── routers.ts          # API routes (tRPC)
│   └── index.ts            # Entry point del servidor
├── drizzle/                # Schema y migraciones
│   └── schema.ts           # Definición de tablas
├── shared/                 # Tipos compartidos
│   └── types.ts            # Schemas Zod
├── data/                   # Base de datos SQLite (gitignored)
├── package.json
├── vite.config.ts
├── drizzle.config.ts
├── .env.example
└── README.md
```

## Base de Datos

El sistema usa SQLite como base de datos local. La base de datos se almacena en `data/database.db` y se inicializa automáticamente con datos seed:

- **Productos**: 5 tipos (Casco Minero, Casco Jockey, Mascarillas, Arañas, Correas)
- **Categorías de Insumos**: 2 (Materia de Alta, Materia de Baja)

## Páginas

| Página | Ruta | Descripción |
|--------|------|-------------|
| Dashboard | `/` | Vista general con KPIs y gráficos |
| Stock | `/stock` | Gestión de inventario por producto y color |
| Producción | `/production` | Registro de producción diaria |
| Despachos | `/shipments` | Control de salidas de productos |
| Insumos | `/raw-materials` | Gestión de materia prima |
| Consumo | `/consumption` | Registro de consumo de insumos |
| Reportes | `/reports` | Análisis por rangos de fecha |
| Configuración | `/settings` | Ajustes del sistema |

## API (tRPC)

El backend expone las siguientes rutas tRPC:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `products.list` | GET | Lista todos los tipos de producto |
| `products.create` | POST | Crea un nuevo tipo de producto |
| `stock.getAll` | GET | Obtiene todo el stock |
| `stock.create` | POST | Crea/actualiza entrada de stock |
| `stock.update` | POST | Actualiza cantidad de stock |
| `production.getAll` | GET | Obtiene todos los registros de producción |
| `production.create` | POST | Registra producción (actualiza stock) |
| `production.update` | POST | Actualiza registro de producción |
| `production.delete` | POST | Elimina registro (revierte stock) |
| `shipments.getAll` | GET | Obtiene todos los despachos |
| `shipments.create` | POST | Registra despacho (descuenta stock) |
| `rawMaterials.getCategories` | GET | Obtiene categorías de insumos |
| `rawMaterials.getAll` | GET | Obtiene todos los insumos |
| `rawMaterials.create` | POST | Registra nuevo insumo |
| `consumption.getAll` | GET | Obtiene historial de consumo |
| `consumption.create` | POST | Registra consumo (descuenta insumo) |
| `reports.productionByRange` | GET | Producción por rango de fecha |
| `reports.shipmentsByRange` | GET | Despachos por rango de fecha |
| `reports.consumptionByRange` | GET | Consumo por rango de fecha |

## Imágenes de Productos

Las imágenes de productos se almacenan en `client/public/images/` y son servidas estáticamente por Vite en desarrollo y por Express en producción.

## Licencia

MIT
