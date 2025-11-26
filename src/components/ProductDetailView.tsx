import React from 'react';
import type { Product } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CloseIcon, PencilIcon, TrashIcon } from './icons';

interface ProductDetailViewProps {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onClose,
  onEdit,
  onDelete
}) => {
  return (
    <div className="w-full h-full max-w-4xl mx-auto flex items-stretch">
      <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-t-3xl w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Detalle de Producto
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Cerrar"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Product Image */}
          {product.image && (
            <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 mb-6">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}

          {/* Product Name */}
          <div className="mb-6">
            <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {product.name}
            </h3>
            {product.category && (
              <span className="inline-block px-3 py-1 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
                {product.category}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Descripción</p>
              <p className="text-base text-slate-800 dark:text-slate-200">{product.description}</p>
            </div>
          )}

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/50 rounded-xl p-6 text-center">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Precio</p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(product.price)}
              </p>
            </div>
            <div className={`rounded-xl p-6 text-center ${
              product.totalQuantity <= 10 
                ? 'bg-orange-50 dark:bg-orange-900/50' 
                : 'bg-blue-50 dark:bg-blue-900/50'
            }`}>
              <p className={`text-sm font-medium mb-2 ${
                product.totalQuantity <= 10 
                  ? 'text-orange-600 dark:text-orange-400' 
                  : 'text-blue-600 dark:text-blue-400'
              }`}>
                Stock Total
              </p>
              <p className={`text-3xl font-bold ${
                product.totalQuantity <= 10 
                  ? 'text-orange-700 dark:text-orange-300' 
                  : 'text-blue-700 dark:text-blue-300'
              }`}>
                {product.totalQuantity}
              </p>
              {product.totalQuantity <= 10 && (
                <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-full">
                  Stock Bajo
                </span>
              )}
            </div>
          </div>

          {/* Variants */}
          {product.hasVariants && product.variants.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Variantes</p>
              <div className="space-y-2">
                {product.variants.map(variant => (
                  <div 
                    key={variant.id} 
                    className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{variant.name}</p>
                      {variant.sku && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">SKU: {variant.sku}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        variant.quantity <= 5 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : 'text-slate-800 dark:text-slate-100'
                      }`}>
                        {variant.quantity}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">unidades</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Creado</p>
              <p className="text-sm text-slate-800 dark:text-slate-200">{formatDate(product.createdAt)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Actualizado</p>
              <p className="text-sm text-slate-800 dark:text-slate-200">{formatDate(product.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="flex-shrink-0 pt-6 px-6 pb-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
          {/* Edit Button */}
          <button
            type="button"
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
          >
            <PencilIcon className="w-5 h-5" />
            Editar Producto
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-red-500/30"
          >
            <TrashIcon className="w-5 h-5" />
            Eliminar Producto
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
