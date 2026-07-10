import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
  getAllProductTypes, getProductTypeById, createProductType, initializeProductTypes,
  getAllStock, getStockByProductTypeAndColor, updateStock, createStockEntry,
  getAllProduction, createProduction, updateProduction, deleteProduction,
  getAllShipments, createShipment,
  getAllRawMaterialCategories, getAllRawMaterial, createRawMaterial, updateRawMaterial,
  initializeRawMaterialCategories,
  getAllRawMaterialConsumption, createConsumption,
  getSheetsConfig, updateSheetsConfig,
  getProductionByRange, getShipmentsByRange, getConsumptionByRange,
} from "./db";

const t = initTRPC.create();

export const appRouter = t.router({
  // ==================== PRODUCTS ====================
  products: {
    list: t.procedure.query(async () => {
      return getAllProductTypes();
    }),
    create: t.procedure.input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
    })).mutation(async ({ input }) => {
      return createProductType(input.name, input.description, input.imageUrl);
    }),
  },

  // ==================== STOCK ====================
  stock: {
    getAll: t.procedure.query(async () => {
      return getAllStock();
    }),
    create: t.procedure.input(z.object({
      productTypeId: z.number(),
      color: z.string().min(1),
      quantity: z.number().min(0),
    })).mutation(async ({ input }) => {
      const existing = await getStockByProductTypeAndColor(input.productTypeId, input.color);
      if (existing) {
        await updateStock(existing.id, existing.quantity + input.quantity);
      } else {
        await createStockEntry(input.productTypeId, input.color, input.quantity);
      }
      return { success: true };
    }),
    update: t.procedure.input(z.object({
      stockId: z.number(),
      quantity: z.number().min(0),
    })).mutation(async ({ input }) => {
      await updateStock(input.stockId, input.quantity);
      return { success: true };
    }),
  },

  // ==================== PRODUCTION ====================
  production: {
    getAll: t.procedure.query(async () => {
      return getAllProduction();
    }),
    create: t.procedure.input(z.object({
      productTypeId: z.number(),
      color: z.string().optional(),
      quantity: z.number().min(1),
      date: z.coerce.date(),
      notes: z.string().optional(),
    })).mutation(async ({ input }) => {
      await createProduction(input.productTypeId, input.color, input.quantity, input.date, input.notes);
      return { success: true };
    }),
    update: t.procedure.input(z.object({
      id: z.number(),
      productTypeId: z.number(),
      color: z.string().optional(),
      quantity: z.number().min(1),
      date: z.coerce.date(),
      notes: z.string().optional(),
    })).mutation(async ({ input }) => {
      await updateProduction(input.id, input.productTypeId, input.color, input.quantity, input.date, input.notes);
      return { success: true };
    }),
    delete: t.procedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      await deleteProduction(input.id);
      return { success: true };
    }),
  },

  // ==================== SHIPMENTS ====================
  shipments: {
    getAll: t.procedure.query(async () => {
      return getAllShipments();
    }),
    create: t.procedure.input(z.object({
      productTypeId: z.number(),
      color: z.string().optional(),
      quantity: z.number().min(1),
      date: z.coerce.date(),
      notes: z.string().optional(),
    })).mutation(async ({ input }) => {
      await createShipment(input.productTypeId, input.color, input.quantity, input.date, input.notes);
      return { success: true };
    }),
  },

  // ==================== RAW MATERIALS ====================
  rawMaterials: {
    getCategories: t.procedure.query(async () => {
      return getAllRawMaterialCategories();
    }),
    getAll: t.procedure.query(async () => {
      return getAllRawMaterial();
    }),
    create: t.procedure.input(z.object({
      categoryId: z.number(),
      name: z.string().min(1),
      quantity: z.string().min(1),
      unit: z.string().min(1),
    })).mutation(async ({ input }) => {
      await createRawMaterial(input.categoryId, input.name, input.quantity, input.unit);
      return { success: true };
    }),
  },

  // ==================== CONSUMPTION ====================
  consumption: {
    getAll: t.procedure.query(async () => {
      return getAllRawMaterialConsumption();
    }),
    create: t.procedure.input(z.object({
      categoryId: z.number(),
      bagsConsumed: z.number().min(1),
      date: z.coerce.date(),
      notes: z.string().optional(),
    })).mutation(async ({ input }) => {
      await createConsumption(input.categoryId, input.bagsConsumed, input.date, input.notes);
      return { success: true };
    }),
  },

  // ==================== SHEETS (STUB - optional Google Sheets) ====================
  sheets: {
    getConfig: t.procedure.query(async () => {
      return getSheetsConfig();
    }),
    updateConfig: t.procedure.input(z.object({
      spreadsheetId: z.string(),
      stockSheetName: z.string(),
      productionSheetName: z.string(),
      shipmentsSheetName: z.string(),
      rawMaterialSheetName: z.string(),
    })).mutation(async ({ input }) => {
      await updateSheetsConfig(
        input.spreadsheetId, input.stockSheetName, input.productionSheetName,
        input.shipmentsSheetName, input.rawMaterialSheetName
      );
      return { success: true };
    }),
    syncAllFromSheets: t.procedure.mutation(async () => {
      return { stock: false, production: false, shipments: false, rawMaterials: false };
    }),
    exportAllToSheets: t.procedure.mutation(async () => {
      return { stock: false, production: false, shipments: false, rawMaterials: false };
    }),
  },

  // ==================== REPORTS ====================
  reports: {
    productionByRange: t.procedure.input(z.object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    })).query(async ({ input }) => {
      return getProductionByRange(input.startDate, input.endDate);
    }),
    shipmentsByRange: t.procedure.input(z.object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    })).query(async ({ input }) => {
      return getShipmentsByRange(input.startDate, input.endDate);
    }),
    consumptionByRange: t.procedure.input(z.object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    })).query(async ({ input }) => {
      return getConsumptionByRange(input.startDate, input.endDate);
    }),
  },
});

export type AppRouter = typeof appRouter;
