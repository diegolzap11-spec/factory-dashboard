import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

/**
 * Tipos de productos EPP
 */
export const productTypes = sqliteTable("product_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
});

export type ProductType = typeof productTypes.$inferSelect;
export type InsertProductType = typeof productTypes.$inferInsert;

/**
 * Stock de productos con colores
 */
export const stock = sqliteTable("stock", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productTypeId: integer("productTypeId").notNull(),
  color: text("color").notNull(),
  quantity: integer("quantity").notNull().default(0),
  lastUpdated: text("lastUpdated").notNull().default(new Date().toISOString()),
});

export type Stock = typeof stock.$inferSelect;
export type InsertStock = typeof stock.$inferInsert;

/**
 * Registro de producción diaria
 */
export const production = sqliteTable("production", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productTypeId: integer("productTypeId").notNull(),
  color: text("color"),
  quantity: integer("quantity").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
});

export type Production = typeof production.$inferSelect;
export type InsertProduction = typeof production.$inferInsert;

/**
 * Registro de despachos
 */
export const shipments = sqliteTable("shipments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productTypeId: integer("productTypeId").notNull(),
  color: text("color"),
  quantity: integer("quantity").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
});

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = typeof shipments.$inferInsert;

/**
 * Categorías de insumos (materia prima)
 */
export const rawMaterialCategories = sqliteTable("raw_material_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
});

export type RawMaterialCategory = typeof rawMaterialCategories.$inferSelect;
export type InsertRawMaterialCategory = typeof rawMaterialCategories.$inferInsert;

/**
 * Stock de insumos (materia prima)
 */
export const rawMaterialStock = sqliteTable("raw_material_stock", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("categoryId").notNull(),
  name: text("name").notNull(),
  quantity: real("quantity").notNull().default(0),
  unit: text("unit").notNull(),
  lastUpdated: text("lastUpdated").notNull().default(new Date().toISOString()),
});

export type RawMaterialStock = typeof rawMaterialStock.$inferSelect;
export type InsertRawMaterialStock = typeof rawMaterialStock.$inferInsert;

/**
 * Consumo de insumos
 */
export const rawMaterialConsumption = sqliteTable("raw_material_consumption", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("categoryId").notNull(),
  bagsConsumed: integer("bagsConsumed").notNull(),
  quantityConsumed: real("quantityConsumed").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
});

export type RawMaterialConsumption = typeof rawMaterialConsumption.$inferSelect;
export type InsertRawMaterialConsumption = typeof rawMaterialConsumption.$inferInsert;

/**
 * Configuración de Google Sheets (opcional)
 */
export const sheetsConfig = sqliteTable("sheets_config", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  spreadsheetId: text("spreadsheetId").notNull().default(""),
  stockSheetName: text("stockSheetName").notNull().default("Stock"),
  productionSheetName: text("productionSheetName").notNull().default("Producción"),
  shipmentsSheetName: text("shipmentsSheetName").notNull().default("Despachos"),
  rawMaterialSheetName: text("rawMaterialSheetName").notNull().default("Insumos"),
  lastSyncTime: text("lastSyncTime"),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().default(new Date().toISOString()),
});

export type SheetsConfig = typeof sheetsConfig.$inferSelect;
export type InsertSheetsConfig = typeof sheetsConfig.$inferInsert;
