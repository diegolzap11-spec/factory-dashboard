import { initializeProductTypes, getAllProductTypes, getStockByProductTypeAndColor, updateStock, createStockEntry } from "./db";

async function seed() {
  console.log("Iniciando carga de stock...");
  
  // Asegurar que los tipos de productos existan
  await initializeProductTypes();
  const products = await getAllProductTypes();
  
  const minero = products.find(p => p.name === "Casco Minero");
  const mascarillas = products.find(p => p.name === "Mascarillas Tipo AS");
  const aranas = products.find(p => p.name === "Arañas");

  if (!minero || !mascarillas || !aranas) {
    console.error("No se encontraron los tipos de productos necesarios.");
    return;
  }

  const stockData = [
    // Cascos Mineros
    { productTypeId: minero.id, color: "Naranja", quantity: 210 },
    { productTypeId: minero.id, color: "Amarillo", quantity: 240 },
    { productTypeId: minero.id, color: "Rojo", quantity: 360 },
    { productTypeId: minero.id, color: "Blanco", quantity: 360 },
    { productTypeId: minero.id, color: "Celeste", quantity: 1170 },
    
    // Mascarillas (5 paquetes de 40u = 200u)
    { productTypeId: mascarillas.id, color: "Estándar", quantity: 200 },
    
    // Suspensiones / Arañas
    { productTypeId: aranas.id, color: "Estándar", quantity: 26350 },
  ];

  for (const item of stockData) {
    const existing = await getStockByProductTypeAndColor(item.productTypeId, item.color);
    if (existing) {
      console.log(`Actualizando ${item.color} para producto ID ${item.productTypeId} a ${item.quantity}`);
      await updateStock(existing.id, item.quantity);
    } else {
      console.log(`Creando ${item.color} para producto ID ${item.productTypeId} con ${item.quantity}`);
      await createStockEntry(item.productTypeId, item.color, item.quantity);
    }
  }

  console.log("Carga de stock completada con éxito.");
}

seed().catch(console.error);
