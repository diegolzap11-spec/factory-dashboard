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
  "blanco",
  "amarillo",
  "naranja",
  "celeste",
  "rojo",
  "verde",
  "azul",
  "plomo",
  "marrón",
] as const;

export type HelmetColor = (typeof HELMET_COLORS)[number];

// Mapeo de colores a valores visuales CSS
export const COLOR_HEX_MAP: Record<string, string> = {
  blanco: "#F5F5F5",
  amarillo: "#FFD700",
  naranja: "#FF8C00",
  celeste: "#87CEEB",
  rojo: "#DC143C",
  verde: "#228B22",
  azul: "#1E90FF",
  plomo: "#808080",
  marrón: "#8B4513",
};

// Productos del casco (Jockey I y Minero)
export const HELMET_PRODUCTS = ["Casco Jockey I", "Casco Minero"] as const;
