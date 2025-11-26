import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../types';
import { INPUT_BASE_CLASSES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import * as inventoryService from '../services/inventoryService';

interface ProductQuantity {
  [productId: string]: {
    quantity: number;
    selectedVariantId?: string;
  };
}

interface NewSaleFormProps {
  onAddTransaction: (transaction: { description: string; amount: number; type: 'inflow'; category?: string; paymentMethod?: string; items?: { productId: string; productName: string; quantity: number; variantName?: string; price: number; }[] }) => void;
  onClose?: () => void;
}

export const NewSaleForm: React.FC<NewSaleFormProps> = ({ onAddTransaction, onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productQuantities, setProductQuantities] = useState<ProductQuantity>({});
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const allProducts = await inventoryService.getAllProducts();
    setProducts(allProducts);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateProductQuantity = (productId: string, newQuantity: number, variantId?: string) => {
    if (newQuantity === 0) {
      // Remove product from quantities
      const newQuantities = { ...productQuantities };
      delete newQuantities[productId];
      setProductQuantities(newQuantities);
    } else {
      setProductQuantities({
        ...productQuantities,
        [productId]: {
          quantity: newQuantity,
          selectedVariantId: variantId
        }
      });
    }
  };

  const updateProductVariant = (productId: string, variantId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const variant = product.variants.find(v => v.id === variantId);
    if (variant && variant.quantity > 0) {
      setProductQuantities({
        ...productQuantities,
        [productId]: {
          quantity: 1,
          selectedVariantId: variantId
        }
      });
    }
  };

  const getMaxStock = (product: Product, variantId?: string) => {
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      return variant?.quantity || 0;
    }
    return product.totalQuantity;
  };

  const calculateTotal = () => {
    return Object.entries(productQuantities).reduce((sum, [productId, data]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return sum;
      return sum + (product.price * data.quantity);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemCount = Object.keys(productQuantities).length;
    if (itemCount === 0) {
      alert('Agrega al menos un producto a la venta');
      return;
    }

    const total = calculateTotal();

    // Update inventory for each item
    for (const [productId, data] of Object.entries(productQuantities)) {
      const product = products.find(p => p.id === productId);
      if (!product) continue;

      if (data.selectedVariantId) {
        // Update variant quantity
        const variant = product.variants.find(v => v.id === data.selectedVariantId);
        if (variant) {
          await inventoryService.updateVariantQuantity(
            productId,
            data.selectedVariantId,
            variant.quantity - data.quantity
          );
        }
      } else {
        // Update standalone product quantity
        await inventoryService.updateProduct(productId, {
          standaloneQuantity: product.totalQuantity - data.quantity
        });
      }
    }

    // Create transaction description
    const description = itemCount === 1 
      ? `Venta: ${products.find(p => p.id === Object.keys(productQuantities)[0])?.name}${Object.values(productQuantities)[0].quantity > 1 ? ` x${Object.values(productQuantities)[0].quantity}` : ''}`
      : `Venta: ${itemCount} productos`;

    // Build items array with product details
    const items = Object.entries(productQuantities).map(([productId, data]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      
      let variantName: string | undefined;
      if (data.selectedVariantId) {
        const variant = product.variants.find(v => v.id === data.selectedVariantId);
        variantName = variant?.name;
      }
      
      return {
        productId: product.id,
        productName: product.name,
        quantity: data.quantity,
        variantName,
        price: product.price
      };
    }).filter(item => item !== null) as { productId: string; productName: string; quantity: number; variantName?: string; price: number; }[];

    // Add transaction
    onAddTransaction({
      description,
      amount: total,
      type: 'inflow',
      paymentMethod: paymentMethod || undefined,
      items
    });

    // Reset and close
    setProductQuantities({});
    setPaymentMethod('');
    setSearchTerm('');
    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        {/* Product Search */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Buscar Producto
          </label>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o categoría..."
            autoFocus
            className={INPUT_BASE_CLASSES}
          />
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 gap-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              <p>No se encontraron productos</p>
            </div>
          ) : (
            filteredProducts.map(product => {
              const productData = productQuantities[product.id];
              const currentQuantity = productData?.quantity || 0;
              const selectedVariantId = productData?.selectedVariantId || (product.hasVariants && product.variants.length > 0 ? product.variants[0].id : undefined);
              const maxStock = getMaxStock(product, selectedVariantId);

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-slate-800 shadow-md rounded-xl overflow-hidden flex relative"
                >
                  {/* Product Image */}
                  <div className="w-24 flex-shrink-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>

                  {/* Variant Selector - Top Right */}
                  {product.hasVariants && product.variants.length > 0 && (
                    <select
                      value={selectedVariantId}
                      onChange={(e) => updateProductVariant(product.id, e.target.value)}
                      className="absolute top-2 right-2 px-2 py-1 text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {product.variants.map(variant => (
                        <option key={variant.id} value={variant.id} disabled={variant.quantity === 0}>
                          {variant.name} ({variant.quantity})
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Product Info */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div className={product.hasVariants && product.variants.length > 0 ? "pr-20" : ""}>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1 line-clamp-2">{product.name}</h3>
                      
                    </div>

                    <div className="flex justify-between items-end gap-3">
                      <div>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.price)}</p>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-0">
                        <button
                          type="button"
                          onClick={() => updateProductQuantity(product.id, Math.max(0, currentQuantity - 1), selectedVariantId)}
                          disabled={currentQuantity === 0}
                          className="w-8 h-8 flex items-center justify-center bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-lg font-bold"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold text-slate-800 dark:text-white">
                          {currentQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateProductQuantity(product.id, currentQuantity + 1, selectedVariantId)}
                          disabled={currentQuantity >= maxStock || maxStock === 0}
                          className="w-8 h-8 flex items-center justify-center bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-lg font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Método de Pago
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className={INPUT_BASE_CLASSES}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Cheque">Cheque</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      {/* Fixed Footer: Total and Submit */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 pt-6 px-6 space-y-4 bg-white dark:bg-slate-800 pb-6 -mx-6">
        {Object.keys(productQuantities).length > 0 && (
          <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">Total:</span>
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={Object.keys(productQuantities).length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-transform transform hover:scale-105 disabled:transform-none shadow-lg"
        >
          Completar Venta
        </button>
      </div>
    </form>
  );
};
