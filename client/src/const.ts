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
