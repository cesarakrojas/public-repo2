import React, { useState, useEffect } from 'react';
import type { Product, ProductVariant } from '../types';
import { PlusIcon, TrashIcon, XMarkIcon } from './icons';
import * as inventoryService from '../services/inventoryService';

interface ProductFormProps {
  product: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [hasVariants, setHasVariants] = useState(false);
  const [standaloneQuantity, setStandaloneQuantity] = useState('');
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id'>[]>([]);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantQuantity, setNewVariantQuantity] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setCategory(product.category || '');
      setImage(product.image || '');
      setHasVariants(product.hasVariants);
      setStandaloneQuantity(product.hasVariants ? '' : product.totalQuantity.toString());
      setVariants(product.variants.map(v => ({ name: v.name, quantity: v.quantity, sku: v.sku })));
    }
  }, [product]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddVariant = () => {
    if (newVariantName.trim() && newVariantQuantity && parseInt(newVariantQuantity) >= 0) {
      setVariants([...variants, { 
        name: newVariantName.trim(), 
        quantity: parseInt(newVariantQuantity),
        sku: undefined
      }]);
      setNewVariantName('');
      setNewVariantQuantity('');
    }
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleUpdateVariantQuantity = (index: number, quantity: string) => {
    const updatedVariants = [...variants];
    updatedVariants[index].quantity = Math.max(0, parseInt(quantity) || 0);
    setVariants(updatedVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !price || parseFloat(price) < 0) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!hasVariants && (!standaloneQuantity || parseInt(standaloneQuantity) < 0)) {
      alert('Por favor ingresa una cantidad válida.');
      return;
    }

    if (hasVariants && variants.length === 0) {
      alert('Por favor agrega al menos una variante o desactiva las variantes.');
      return;
    }

    try {
      if (product) {
        // Update existing product
        await inventoryService.updateProduct(product.id, {
          name,
          description: description || undefined,
          price: parseFloat(price),
          category: category || undefined,
          image: image || undefined,
          hasVariants,
          variants: hasVariants ? variants.map((v, i) => ({
            id: product.variants[i]?.id || `temp_${i}`,
            ...v
          })) : [],
          standaloneQuantity: !hasVariants ? parseInt(standaloneQuantity) : undefined
        });
      } else {
        // Create new product
        await inventoryService.createProduct(
          name,
          parseFloat(price),
          description || undefined,
          image || undefined,
          category || undefined,
          hasVariants,
          variants,
          !hasVariants ? parseInt(standaloneQuantity) : 0
        );
      }
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Nombre del Producto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Camiseta básica"
          required
          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción del producto..."
          rows={3}
          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 resize-none"
        />
      </div>

      {/* Price and Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Precio <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Categoría
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ej: Ropa, Electrónica"
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Imagen del Producto
        </label>
        {image && (
          <div className="relative mb-2 w-full h-48 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setImage('')}
              className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/50 dark:file:text-emerald-300"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Máximo 2MB</p>
      </div>

      {/* Variants Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">¿Este producto tiene variantes?</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ej: Tallas (S, M, L), Colores, etc.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setHasVariants(!hasVariants);
            if (!hasVariants) {
              setStandaloneQuantity('');
            } else {
              setVariants([]);
            }
          }}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            hasVariants ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              hasVariants ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Standalone Quantity (no variants) */}
      {!hasVariants && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Cantidad Disponible <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={standaloneQuantity}
            onChange={(e) => setStandaloneQuantity(e.target.value)}
            placeholder="0"
            min="0"
            required
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
          />
        </div>
      )}

      {/* Variants Section */}
      {hasVariants && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Variantes
          </label>

          {/* Existing Variants */}
          {variants.length > 0 && (
            <div className="space-y-2 mb-3">
              {variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{variant.name}</span>
                  <input
                    type="number"
                    value={variant.quantity}
                    onChange={(e) => handleUpdateVariantQuantity(index, e.target.value)}
                    min="0"
                    className="w-24 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Variant */}
          <div className="flex flex-col sm:flex-row gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <input
              type="text"
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVariant())}
              placeholder="Nombre (Ej: S, M, L)"
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            />
            <input
              type="number"
              value={newVariantQuantity}
              onChange={(e) => setNewVariantQuantity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVariant())}
              placeholder="Cantidad"
              min="0"
              className="w-full sm:w-32 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Agregar
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Form Actions - Sticky Footer */}
      <div className="flex-shrink-0 flex gap-3 pt-6 px-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pb-6 -mx-6">
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
        >
          {product ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
