import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { initializeProductTypes, initializeRawMaterialCategories } from "./db";
import * as path from "node:path";
import * as fs from "node:fs";

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Initialize database
async function initDb() {
  await initializeProductTypes();
  await initializeRawMaterialCategories();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (frontend build)
if (NODE_ENV === "production") {
  const publicDir = path.join(process.cwd(), "dist", "public");
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get("*", (req, res) => {
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }
}

// tRPC endpoint
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    console.log(`API: http://localhost:${PORT}/trpc`);
  });
}

start().catch(console.error);
