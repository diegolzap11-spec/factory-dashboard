import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import {
  productTypes, production, shipments, stock,
  rawMaterialCategories, rawMaterialStock, rawMaterialConsumption, sheetsConfig,
  type InsertProductType, type InsertStock, type InsertProduction,
  type InsertShipment, type InsertRawMaterialCategory, type InsertRawMaterialStock,
  type InsertRawMaterialConsumption, type InsertSheetsConfig,
} from "../drizzle/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import * as fs from "node:fs";
import * as path from "node:path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.DATABASE_URL || path.join(DB_DIR, "database.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const sqlite = new Database(DB_PATH);
const db = drizzle(sqlite);

// ==================== PRODUCT TYPES ====================

export async function initializeProductTypes() {
  const existing = await getAllProductTypes();
  if (existing.length > 0) return;

  const defaults: Omit<InsertProductType, "id" | "createdAt">[] = [
    { name: "Casco Minero", description: "Casco de seguridad tipo minero con ala completa", imageUrl: "/images/casco-minero.jpg" },
    { name: "Casco Jockey I", description: "Casco de seguridad tipo jockey", imageUrl: "/images/casco-jockey.jpg" },
    { name: "Mascarillas Tipo AS", description: "Mascarillas de protección respiratoria tipo AS", imageUrl: "/images/mascarillas.jpg" },
    { name: "Arañas", description: "Arneses de seguridad y protección contra caídas", imageUrl: "/images/arneses.jpg" },
    { name: "Correas", description: "Correas de seguridad industrial", imageUrl: "/images/correas.jpg" },
  ];

  for (const d of defaults) {
    await createProductType(d.name, d.description, d.imageUrl);
  }

  // Carga de stock inicial solicitado por el usuario
  const products = await getAllProductTypes();
  const minero = products.find(p => p.name === "Casco Minero");
  const mascarillas = products.find(p => p.name === "Mascarillas Tipo AS");
  const aranas = products.find(p => p.name === "Arañas");

  if (minero && mascarillas && aranas) {
    const initialStock = [
      { productTypeId: minero.id, color: "Naranja", quantity: 210 },
      { productTypeId: minero.id, color: "Amarillo", quantity: 240 },
      { productTypeId: minero.id, color: "Rojo", quantity: 360 },
      { productTypeId: minero.id, color: "Blanco", quantity: 360 },
      { productTypeId: minero.id, color: "Celeste", quantity: 1170 },
      { productTypeId: mascarillas.id, color: "Estándar", quantity: 200 }, // 5 paquetes de 40u
      { productTypeId: aranas.id, color: "Estándar", quantity: 26350 },
    ];

    for (const item of initialStock) {
      const existing = await getStockByProductTypeAndColor(item.productTypeId, item.color);
      if (!existing) {
        await createStockEntry(item.productTypeId, item.color, item.quantity);
      } else {
        await updateStock(existing.id, item.quantity);
      }
    }
  }
}

export async function initializeRawMaterialCategories() {
  const existing = await getAllRawMaterialCategories();
  if (existing.length > 0) return;

  const defaults: Omit<InsertRawMaterialCategory, "id" | "createdAt">[] = [
    { name: "materia de alta", description: "Materia prima de alta calidad para producción" },
    { name: "materia de baja", description: "Materia prima de calidad estándar" },
  ];

  for (const d of defaults) {
    await createRawMaterialCategory(d.name, d.description);
  }
}

export async function getAllProductTypes() {
  return db.select().from(productTypes);
}

export async function getProductTypeById(id: number) {
  const result = await db.select().from(productTypes).where(eq(productTypes.id, id)).limit(1);
  return result[0] || null;
}

export async function createProductType(name: string, description?: string, imageUrl?: string) {
  return db.insert(productTypes).values({ name, description, imageUrl }).run();
}

// ==================== STOCK ====================

export async function getStockByProductType(productTypeId: number) {
  return db.select().from(stock).where(eq(stock.productTypeId, productTypeId));
}

export async function getStockByProductTypeAndColor(productTypeId: number, color: string) {
  const result = await db.select().from(stock).where(
    and(eq(stock.productTypeId, productTypeId), eq(stock.color, color))
  );
  return result.length > 0 ? result[0] : null;
}

export async function getAllStock() {
  return db.select().from(stock);
}

export async function updateStock(stockId: number, quantity: number) {
  const safeQty = Math.max(0, quantity);
  await db.update(stock)
    .set({ quantity: safeQty, lastUpdated: new Date().toISOString() })
    .where(eq(stock.id, stockId));
}

export async function createStockEntry(productTypeId: number, color: string, quantity: number) {
  return db.insert(stock).values({ productTypeId, color, quantity }).run();
}

// ==================== PRODUCTION ====================

export async function getAllProduction() {
  return db.select().from(production).orderBy(desc(production.date));
}

export async function createProduction(productTypeId: number, color: string | undefined, quantity: number, date: Date, notes?: string) {
  const dateStr = date.toISOString();
  await db.insert(production).values({ productTypeId, color, quantity, date: dateStr, notes });

  // Aumentar stock automáticamente
  if (color) {
    const existingStock = await getStockByProductTypeAndColor(productTypeId, color);
    if (existingStock) {
      const newQuantity = existingStock.quantity + quantity;
      await updateStock(existingStock.id, newQuantity);
    } else {
      await createStockEntry(productTypeId, color, quantity);
    }
  }
}

export async function updateProduction(productionId: number, productTypeId: number, color: string | undefined, quantity: number, date: Date, notes?: string) {
  const old = await db.select().from(production).where(eq(production.id, productionId)).limit(1);
  if (!old || old.length === 0) return;

  // Revertir el stock anterior
  if (old[0].color) {
    const existingStock = await getStockByProductTypeAndColor(old[0].productTypeId, old[0].color);
    if (existingStock) {
      const newQuantity = Math.max(0, existingStock.quantity - old[0].quantity);
      await updateStock(existingStock.id, newQuantity);
    }
  }

  // Aplicar el nuevo stock
  if (color) {
    const existingStock = await getStockByProductTypeAndColor(productTypeId, color);
    if (existingStock) {
      const newQuantity = existingStock.quantity + quantity;
      await updateStock(existingStock.id, newQuantity);
    } else {
      await createStockEntry(productTypeId, color, quantity);
    }
  }

  const dateStr = date.toISOString();
  await db.update(production).set({ productTypeId, color, quantity, date: dateStr, notes }).where(eq(production.id, productionId));
}

export async function deleteProduction(productionId: number) {
  const productionRecord = await db.select().from(production).where(eq(production.id, productionId)).limit(1);
  if (!productionRecord || productionRecord.length === 0) return;

  const prod = productionRecord[0];

  // Revertir el stock
  if (prod.color) {
    const existingStock = await getStockByProductTypeAndColor(prod.productTypeId, prod.color);
    if (existingStock) {
      const newQuantity = Math.max(0, existingStock.quantity - prod.quantity);
      await updateStock(existingStock.id, newQuantity);
    }
  }

  await db.delete(production).where(eq(production.id, productionId));
}

// ==================== SHIPMENTS ====================

export async function getAllShipments() {
  return db.select().from(shipments).orderBy(desc(shipments.date));
}

export async function createShipment(productTypeId: number, color: string | undefined, quantity: number, date: Date, notes?: string) {
  if (color) {
    const existingStock = await getStockByProductTypeAndColor(productTypeId, color);
    if (existingStock) {
      if (existingStock.quantity < quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${existingStock.quantity}, Solicitado: ${quantity}`);
      }
      const newQuantity = existingStock.quantity - quantity;
      await updateStock(existingStock.id, newQuantity);
    } else {
      throw new Error(`No existe stock para este producto y color`);
    }
  }

  const dateStr = date.toISOString();
  await db.insert(shipments).values({ productTypeId, color, quantity, date: dateStr, notes });
}

// ==================== RAW MATERIALS ====================

export async function getAllRawMaterialCategories() {
  return db.select().from(rawMaterialCategories);
}

export async function getRawMaterialByCategory(categoryId: number) {
  return db.select().from(rawMaterialStock).where(eq(rawMaterialStock.categoryId, categoryId));
}

export async function getAllRawMaterial() {
  return db.select().from(rawMaterialStock);
}

export async function updateRawMaterial(materialId: number, quantity: number) {
  const safeQty = Math.max(0, quantity);
  await db.update(rawMaterialStock)
    .set({ quantity: safeQty, lastUpdated: new Date().toISOString() })
    .where(eq(rawMaterialStock.id, materialId));
}

export async function createRawMaterialCategory(name: string, description?: string) {
  return db.insert(rawMaterialCategories).values({ name, description }).run();
}

export async function createRawMaterial(categoryId: number, name: string, quantity: string, unit: string) {
  return db.insert(rawMaterialStock).values({ categoryId, name, quantity: parseFloat(quantity), unit }).run();
}

// ==================== RAW MATERIAL CONSUMPTION ====================

export async function getAllRawMaterialConsumption() {
  return db.select().from(rawMaterialConsumption).orderBy(desc(rawMaterialConsumption.date));
}

export async function createConsumption(categoryId: number, bagsConsumed: number, date: Date, notes?: string) {
  const quantityConsumed = bagsConsumed * 25;
  const dateStr = date.toISOString();

  await db.insert(rawMaterialConsumption).values({ categoryId, bagsConsumed, quantityConsumed, date: dateStr, notes });

  const materials = await getRawMaterialByCategory(categoryId);
  if (materials && materials.length > 0) {
    for (const material of materials) {
      const currentQty = parseFloat(material.quantity.toString());
      const newQty = Math.max(0, currentQty - (bagsConsumed * 25));
      await updateRawMaterial(material.id, newQty);
    }
  }
}

// ==================== SHEETS CONFIG ====================

export async function getSheetsConfig() {
  const result = await db.select().from(sheetsConfig).limit(1);
  return result[0] || null;
}

export async function updateSheetsConfig(spreadsheetId: string, stockSheetName: string, productionSheetName: string, shipmentsSheetName: string, rawMaterialSheetName: string) {
  const existing = await getSheetsConfig();
  if (existing) {
    await db.update(sheetsConfig).set({
      spreadsheetId, stockSheetName, productionSheetName, shipmentsSheetName, rawMaterialSheetName,
      updatedAt: new Date().toISOString(),
    }).where(eq(sheetsConfig.id, existing.id));
  } else {
    await db.insert(sheetsConfig).values({
      spreadsheetId, stockSheetName, productionSheetName, shipmentsSheetName, rawMaterialSheetName,
    }).run();
  }
}

// ==================== REPORT DATA ====================

export async function getProductionByRange(startDate: Date, endDate: Date) {
  const start = startDate.toISOString();
  const end = endDate.toISOString();
  return db.select().from(production).where(
    and(gte(production.date, start), lte(production.date, end))
  ).orderBy(desc(production.date));
}

export async function getShipmentsByRange(startDate: Date, endDate: Date) {
  const start = startDate.toISOString();
  const end = endDate.toISOString();
  return db.select().from(shipments).where(
    and(gte(shipments.date, start), lte(shipments.date, end))
  ).orderBy(desc(shipments.date));
}

export async function getConsumptionByRange(startDate: Date, endDate: Date) {
  const start = startDate.toISOString();
  const end = endDate.toISOString();
  return db.select().from(rawMaterialConsumption).where(
    and(gte(rawMaterialConsumption.date, start), lte(rawMaterialConsumption.date, end))
  ).orderBy(desc(rawMaterialConsumption.date));
}
