export const APP_NAME = "Flexo Impress";
export const APP_DESCRIPTION = "Sistema de Gestión de Producción e Inventario";

export const PRODUCT_IMAGES: Record<string, string> = {
  "Casco Minero": "/images/casco-minero.jpg",
  "Casco Jockey I": "/images/casco-jockey.jpg",
  "Mascarillas Tipo AS": "/images/mascarillas.jpg",
  "Arañas": "/images/arneses.jpg",
  "Correas": "/images/correas.jpg",
};

export function getProductImage(productName: string): string {
  const key = productName as keyof typeof PRODUCT_IMAGES;
  if (PRODUCT_IMAGES[key]) return PRODUCT_IMAGES[key];
  const found = Object.entries(PRODUCT_IMAGES).find(([k]) =>
    k.toLowerCase() === productName.toLowerCase()
  );
  return found ? found[1] : "/images/casco-minero.jpg";
}

// Colores para cascos en orden específico
export const HELMET_COLORS = [
  { id: "1", name: "Blanco", hex: "#FFFFFF" },
  { id: "2", name: "Amarillo", hex: "#FFFF00" },
  { id: "3", name: "Azul", hex: "#0000FF" },
  { id: "4", name: "Verde", hex: "#008000" },
  { id: "5", name: "Rojo", hex: "#FF0000" },
  { id: "6", name: "Naranja", hex: "#FFA500" },
  { id: "7", name: "Gris", hex: "#808080" },
  { id: "8", name: "Marrón", hex: "#A52A2A" },
  { id: "9", name: "Dorado", hex: "#FFD700" },
] as const;

export type HelmetColor = (typeof HELMET_COLORS)[number]["name"];

// Mapeo de colores a valores visuales CSS
export const COLOR_HEX_MAP: Record<string, string> = {
  "Blanco": "#FFFFFF",
  "Amarillo": "#FFFF00",
  "Azul": "#0000FF",
  "Verde": "#008000",
  "Rojo": "#FF0000",
  "Naranja": "#FFA500",
  "Gris": "#808080",
  "Marrón": "#A52A2A",
  "Dorado": "#FFD700",
};

// Productos del casco (Jockey I y Minero)
export const HELMET_PRODUCTS = ["Casco Jockey I", "Casco Minero"] as const;

export const PRODUCT_NAMES = [
  "Casco Minero",
  "Casco Jockey I",
  "Mascarillas Tipo AS",
  "Arañas",
  "Correas",
] as const;
