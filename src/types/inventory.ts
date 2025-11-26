export interface ProductVariant {
  id: string;
  name: string; // e.g., "S", "M", "L", "XL" or "Rojo", "Azul"
  quantity: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  image?: string; // base64 or URL
  price: number;
  totalQuantity: number; // Sum of all variants or standalone quantity
  hasVariants: boolean;
  variants: ProductVariant[];
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFilters {
  searchTerm?: string;
  category?: string;
  lowStock?: boolean;
}
