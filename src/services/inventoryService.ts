import type { Product, ProductVariant, InventoryFilters } from '../types';

const STORAGE_KEY = 'inventory_products';

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Get all products from localStorage
const getProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Save products to localStorage
const saveProducts = (products: Product[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  
  // Trigger storage event for multi-tab sync
  window.dispatchEvent(new StorageEvent('storage', {
    key: STORAGE_KEY,
    newValue: JSON.stringify(products)
  }));
};

// Calculate total quantity from variants
const calculateTotalQuantity = (hasVariants: boolean, variants: ProductVariant[], standaloneQty: number): number => {
  if (hasVariants && variants.length > 0) {
    return variants.reduce((sum, v) => sum + v.quantity, 0);
  }
  return standaloneQty;
};

// Get all products with optional filters
export const getAllProducts = async (filters?: InventoryFilters): Promise<Product[]> => {
  let products = getProducts();
  
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.description?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
  }
  
  if (filters?.category) {
    products = products.filter(p => p.category === filters.category);
  }
  
  if (filters?.lowStock) {
    products = products.filter(p => p.totalQuantity <= 10);
  }
  
  return products.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

// Create a new product
export const createProduct = async (
  name: string,
  price: number,
  description?: string,
  image?: string,
  category?: string,
  hasVariants: boolean = false,
  variants: Omit<ProductVariant, 'id'>[] = [],
  standaloneQuantity: number = 0
): Promise<Product> => {
  const products = getProducts();
  
  const productVariants: ProductVariant[] = variants.map(v => ({
    ...v,
    id: generateId()
  }));
  
  const totalQuantity = calculateTotalQuantity(hasVariants, productVariants, standaloneQuantity);
  
  const newProduct: Product = {
    id: generateId(),
    name: name.trim(),
    description: description?.trim(),
    image,
    price,
    totalQuantity,
    hasVariants,
    variants: productVariants,
    category: category?.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  saveProducts(products);
  
  return newProduct;
};

// Update an existing product
export const updateProduct = async (
  productId: string,
  updates: {
    name?: string;
    description?: string;
    image?: string;
    price?: number;
    category?: string;
    hasVariants?: boolean;
    variants?: ProductVariant[];
    standaloneQuantity?: number;
  }
): Promise<Product> => {
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    throw new Error('Product not found');
  }
  
  const currentProduct = products[productIndex];
  
  // Determine final hasVariants state
  const hasVariants = updates.hasVariants !== undefined ? updates.hasVariants : currentProduct.hasVariants;
  const variants = updates.variants !== undefined ? updates.variants : currentProduct.variants;
  const standaloneQty = updates.standaloneQuantity !== undefined ? updates.standaloneQuantity : currentProduct.totalQuantity;
  
  const updatedProduct: Product = {
    ...currentProduct,
    ...updates,
    name: updates.name?.trim() || currentProduct.name,
    description: updates.description?.trim(),
    category: updates.category?.trim(),
    hasVariants,
    variants,
    totalQuantity: calculateTotalQuantity(hasVariants, variants, standaloneQty),
    updatedAt: new Date().toISOString()
  };
  
  products[productIndex] = updatedProduct;
  saveProducts(products);
  
  return updatedProduct;
};

// Delete a product
export const deleteProduct = async (productId: string): Promise<void> => {
  const products = getProducts();
  const filteredProducts = products.filter(p => p.id !== productId);
  saveProducts(filteredProducts);
};

// Update variant quantity
export const updateVariantQuantity = async (
  productId: string,
  variantId: string,
  newQuantity: number
): Promise<Product> => {
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    throw new Error('Product not found');
  }
  
  const product = products[productIndex];
  const variantIndex = product.variants.findIndex(v => v.id === variantId);
  
  if (variantIndex === -1) {
    throw new Error('Variant not found');
  }
  
  product.variants[variantIndex].quantity = Math.max(0, newQuantity);
  product.totalQuantity = product.variants.reduce((sum, v) => sum + v.quantity, 0);
  product.updatedAt = new Date().toISOString();
  
  products[productIndex] = product;
  saveProducts(products);
  
  return product;
};

// Get product by ID
export const getProductById = async (productId: string): Promise<Product | null> => {
  const products = getProducts();
  return products.find(p => p.id === productId) || null;
};

// Get all unique categories
export const getCategories = (): string[] => {
  const products = getProducts();
  const categories = products
    .map(p => p.category)
    .filter((c): c is string => !!c);
  return Array.from(new Set(categories)).sort();
};

// Subscribe to inventory changes
export const subscribeToInventory = (callback: (products: Product[]) => void): () => void => {
  callback(getProducts());
  
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getProducts());
    }
  };
  
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
};
