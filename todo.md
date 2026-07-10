# Factory Dashboard - TODO

## Fase 1: Base de Datos y Backend
- [x] Definir esquema Drizzle para productos, stock, producción, despachos e insumos
- [x] Crear migraciones SQL
- [x] Implementar procedimientos tRPC para CRUD de datos
- [x] Configurar Google Sheets API y autenticación

## Fase 2: Imágenes de Productos
- [x] Buscar/descargar imágenes de casco minero
- [x] Buscar/descargar imágenes de casco jockey
- [x] Buscar/descargar imágenes de máscaras
- [x] Buscar/descargar imágenes de arneses
- [x] Buscar/descargar imágenes de correas
- [x] Subir imágenes a almacenamiento

## Fase 3: Frontend - Layout y Componentes
- [x] Crear DashboardLayout con sidebar de navegación
- [x] Implementar página de Stock con tarjetas de productos
- [x] Implementar página de Producción con formulario
- [x] Implementar página de Despachos con historial
- [x] Implementar página de Insumos
- [x] Crear componentes reutilizables (ProductCard, StockItem, etc.)
- [x] Agregar campo de color al formulario de Producción

## Fase 4: Integración Google Sheets
- [x] Implementar lectura de datos desde Google Sheets
- [x] Implementar escritura de datos en Google Sheets
- [x] Crear sincronización automática de datos
- [x] Configurar polling/refresh automático
- [x] Inicializar categorías de productos y insumos

## Fase 5: Dashboard Principal
- [x] Crear página de inicio con métricas clave
- [x] Implementar gráficos de barras (producción, despachos)
- [x] Implementar gráficos de líneas (tendencias)
- [x] Agregar tarjetas de resumen (stock total, insumos)

## Fase 6: Documentación y Entrega
- [x] Crear guía de configuración de Google Sheets
- [x] Documentar estructura de datos
- [x] Crear instrucciones de uso
- [x] Realizar pruebas finales
- [x] Inicializar datos de prueba

## Fase 7: Integracion Produccion-Despachos-Stock
- [x] Integrar Produccion con Stock: aumentar automaticamente stock al registrar
- [x] Mejorar Despachos: agregar campo de color y descontar del stock especifico
- [x] Validar que no haya descuentos de stock negativo
- [x] Actualizar Dashboard en tiempo real sin recargas (auto-refresh cada 5 segundos)

## Fase 8: Consumo de Insumos
- [x] Crear tabla de consumo de insumos en base de datos
- [x] Crear modulo de Consumo de Insumos en frontend
- [x] Registrar consumo de bolsas (25 kg) de materia prima
- [x] Descontar automaticamente del inventario de insumos
- [x] Actualizar Dashboard con stock de insumos

## Fase 9: Preparacion para Google Sheets
- [x] Eliminar datos hardcodeados
- [x] Preparar estructura para lectura desde Google Sheets
- [x] Validar que toda logica sea independiente de datos en codigo

## Fase 10: Mejoras Adicionales del Sistema

### 1. Lógica de Stock Correcta
- [x] Corregir acumulación de stock (sumar producción, restar despachos)
- [x] Validar que stock no sea negativo
- [x] Recalcular stock cuando se edita/elimina producción

### 2. Editar/Eliminar Producción
- [x] Agregar botones de editar en historial de producción
- [x] Agregar botones de eliminar en historial de producción
- [x] Implementar modal de edición
- [x] Recalcular stock automáticamente al editar
- [x] Recalcular stock automáticamente al eliminar

### 3. Materia Prima en kg
- [x] Cambiar unidad de bolsas a kg en base de datos
- [x] Convertir bolsas a kg automáticamente (1 bolsa = 25 kg)
- [x] Actualizar interfaz de consumo de insumos

### 4. Dashboard Simplificado
- [x] Mostrar solo 4 tarjetas principales
- [x] Producción de Casco Jockey
- [x] Producción de Casco Minero
- [x] Producción de Mascarillas
- [x] Total de Despachos del día

### 5. Actualización en Tiempo Real
- [x] Validar que todos los cambios se reflejan automáticamente
- [x] Pruebas de edición/eliminación con actualización de stock
- [x] Pruebas de dashboard en tiempo real

## Fase 11: Identidad Visual Flexo Impress
- [x] Subir logo de Flexo Impress a almacenamiento
- [x] Actualizar paleta de colores en index.css (dorado #E5A820, negro #1A1A1A)
- [x] Aplicar identidad en sidebar (fondo negro, texto blanco, activo dorado)
- [x] Colocar logo en esquina superior izquierda con nombre de empresa
- [x] Aplicar colores en botones, tarjetas, gráficos e iconos
- [x] Mantener verde/amarillo/rojo solo para alertas
- [x] Verificar que no se alteró estructura ni funcionalidad

## Fase 12: Rediseño Visual Dark Mode Premium
- [x] Actualizar index.css con tema oscuro (#121212 / #16181D)
- [x] Cambiar tipografía a Plus Jakarta Sans
- [x] Rediseñar sidebar con estilo elegante y logo con presencia
- [x] Tarjetas oscuras con bordes suaves y sombras
- [x] Bordes redondeados 16-20px
- [x] Color amarillo solo como acento
- [x] Menú activo con brillo amarillo discreto
- [x] Botón "Agregar Stock" con diseño premium y hover elegante
- [x] Tarjetas de productos: fondo oscuro, imagen centrada, nombre blanco, cantidad amarilla, línea amarilla inferior
- [x] Animaciones suaves al cargar y hover
- [x] Mayor espacio entre componentes
- [x] Verificar que NO se modificó funcionalidad alguna
