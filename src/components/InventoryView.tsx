import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { PlusIcon } from './icons';
import { formatCurrency } from '../utils/formatters';
import * as inventoryService from '../services/inventoryService';

interface InventoryViewProps {
  viewMode?: 'list' | 'create' | 'edit' | 'detail';
  editingProductId?: string | null;
  onChangeView?: (mode: 'list' | 'create' | 'edit' | 'detail', productId?: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  onChangeView 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Load products
  const loadProducts = async () => {
    const filters = {
      searchTerm: searchTerm || undefined,
      category: selectedCategory || undefined,
      lowStock: showLowStock || undefined
    };
    const loadedProducts = await inventoryService.getAllProducts(filters);
    setProducts(loadedProducts);
  };

  useEffect(() => {
    loadProducts();
    setCategories(inventoryService.getCategories());

    // Subscribe to changes
    const unsubscribe = inventoryService.subscribeToInventory(() => {
      loadProducts();
      setCategories(inventoryService.getCategories());
    });

    return unsubscribe;
  }, [searchTerm, selectedCategory, showLowStock]);

  const handleCreateProduct = () => {
    if (onChangeView) onChangeView('create');
  };

  const handleViewProduct = (product: Product) => {
    if (onChangeView) onChangeView('detail', product.id);
  };

  const getTotalValue = () => {
    return products.reduce((sum, p) => sum + (p.price * p.totalQuantity), 0);
  };

  const getLowStockCount = () => {
    return products.filter(p => p.totalQuantity <= 10).length;
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in-up space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Inventario</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gestiona tus productos y existencias
            </p>
          </div>
          <button
            onClick={handleCreateProduct}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-500/30 transition-transform transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-xl">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Total Productos</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{products.length}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-xl">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Valor Total</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(getTotalValue())}</p>
          </div>
          <div className="bg-orange-100 dark:bg-orange-900/50 p-4 rounded-xl">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Stock Bajo</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{getLowStockCount()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-slate-700 dark:text-slate-200">Solo stock bajo</span>
          </label>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-12 text-center">
            {/* ... (empty state code remains the same) ... */}
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">No hay productos en el inventario</p>
            <button
              onClick={handleCreateProduct}
              className="mt-4 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Crear tu primer producto
            </button>
          </div>
        ) : (
          products.map(product => (
            <div
              key={product.id}
              // 1. ADDED "relative" here
              className="relative bg-white dark:bg-slate-800 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer flex"
              onClick={() => handleViewProduct(product)}
            >
              
              {/* 2. MOVED "Bajo" Tag Here with absolute positioning */}
              {product.totalQuantity <= 10 && (
                <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-full z-10">
                  Bajo
                </span>
              )}

              {/* Product Image */}
              <div className="w-32 flex-shrink-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 line-clamp-2 pr-8">{/* Added pr-8 to prevent text overlap with tag */}
                    {product.name}
                  </h3>
                  
                  {product.category && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded mb-2">
                      {product.category}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Precio</p>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Stock</p>
                    {/* 3. REMOVED the "Bajo" tag from here */}
                    <p className={`text-base font-bold ${product.totalQuantity <= 10 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {product.totalQuantity}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
