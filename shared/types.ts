import { z } from "zod";

export const productTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.string().or(z.date()),
});

export const stockSchema = z.object({
  id: z.number(),
  productTypeId: z.number(),
  color: z.string(),
  quantity: z.number(),
  lastUpdated: z.string().or(z.date()),
});

export const productionSchema = z.object({
  id: z.number(),
  productTypeId: z.number(),
  color: z.string().nullable(),
  quantity: z.number(),
  date: z.string().or(z.date()),
  notes: z.string().nullable(),
  createdAt: z.string().or(z.date()),
});

export const shipmentSchema = z.object({
  id: z.number(),
  productTypeId: z.number(),
  color: z.string().nullable(),
  quantity: z.number(),
  date: z.string().or(z.date()),
  notes: z.string().nullable(),
  createdAt: z.string().or(z.date()),
});

export const rawMaterialCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().or(z.date()),
});

export const rawMaterialStockSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  name: z.string(),
  quantity: z.string(),
  unit: z.string(),
  lastUpdated: z.string().or(z.date()),
});

export const rawMaterialConsumptionSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  bagsConsumed: z.number(),
  quantityConsumed: z.string(),
  date: z.string().or(z.date()),
  notes: z.string().nullable(),
  createdAt: z.string().or(z.date()),
});

export const sheetsConfigSchema = z.object({
  id: z.number(),
  spreadsheetId: z.string(),
  stockSheetName: z.string(),
  productionSheetName: z.string(),
  shipmentsSheetName: z.string(),
  rawMaterialSheetName: z.string(),
  lastSyncTime: z.string().or(z.date()).nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type ProductType = z.infer<typeof productTypeSchema>;
export type Stock = z.infer<typeof stockSchema>;
export type Production = z.infer<typeof productionSchema>;
export type Shipment = z.infer<typeof shipmentSchema>;
export type RawMaterialCategory = z.infer<typeof rawMaterialCategorySchema>;
export type RawMaterialStock = z.infer<typeof rawMaterialStockSchema>;
export type RawMaterialConsumption = z.infer<typeof rawMaterialConsumptionSchema>;
export type SheetsConfig = z.infer<typeof sheetsConfigSchema>;
