import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, SunIcon, MoonIcon, ChevronDownIcon, ChevronUpIcon } from './icons';
import { CURRENCIES } from '../utils/constants';

export interface CategoryConfig {
  enabled: boolean;
  inflowCategories: string[];
  outflowCategories: string[];
}

interface CategorySettingsProps {
  onSave: (config: CategoryConfig) => void;
  initialConfig: CategoryConfig;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currencyCode: string;
  onCurrencyChange: (currencyCode: string) => void;
}

export const CategorySettings: React.FC<CategorySettingsProps> = ({
  onSave,
  initialConfig,
  isDarkMode,
  onToggleTheme,
  currencyCode,
  onCurrencyChange
}) => {
  const [enabled, setEnabled] = useState(initialConfig.enabled);
  const [inflowCategories, setInflowCategories] = useState<string[]>(initialConfig.inflowCategories);
  const [outflowCategories, setOutflowCategories] = useState<string[]>(initialConfig.outflowCategories);
  const [newInflowCategory, setNewInflowCategory] = useState('');
  const [newOutflowCategory, setNewOutflowCategory] = useState('');
  const [editingInflowIndex, setEditingInflowIndex] = useState<number | null>(null);
  const [editingOutflowIndex, setEditingOutflowIndex] = useState<number | null>(null);
  const [editingInflowValue, setEditingInflowValue] = useState('');
  const [editingOutflowValue, setEditingOutflowValue] = useState('');
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setEnabled(initialConfig.enabled);
    setInflowCategories(initialConfig.inflowCategories);
    setOutflowCategories(initialConfig.outflowCategories);
    setIsInitialized(true);
  }, [initialConfig]);

  // Auto-save whenever configuration changes (skip first render)
  useEffect(() => {
    if (!isInitialized) return;
    
    const config: CategoryConfig = {
      enabled,
      inflowCategories,
      outflowCategories
    };
    onSave(config);
  }, [enabled, inflowCategories, outflowCategories]);

  // Inflow category handlers
  const handleAddInflowCategory = () => {
    if (newInflowCategory.trim() && !inflowCategories.includes(newInflowCategory.trim())) {
      setInflowCategories([...inflowCategories, newInflowCategory.trim()]);
      setNewInflowCategory('');
    }
  };

  const handleDeleteInflowCategory = (index: number) => {
    setInflowCategories(inflowCategories.filter((_, i) => i !== index));
  };

  const handleStartEditInflow = (index: number) => {
    setEditingInflowIndex(index);
    setEditingInflowValue(inflowCategories[index]);
  };

  const handleSaveEditInflow = () => {
    if (editingInflowIndex !== null && editingInflowValue.trim() && !inflowCategories.includes(editingInflowValue.trim())) {
      const newCategories = [...inflowCategories];
      newCategories[editingInflowIndex] = editingInflowValue.trim();
      setInflowCategories(newCategories);
      setEditingInflowIndex(null);
      setEditingInflowValue('');
    }
  };

  const handleCancelEditInflow = () => {
    setEditingInflowIndex(null);
    setEditingInflowValue('');
  };

  // Outflow category handlers
  const handleAddOutflowCategory = () => {
    if (newOutflowCategory.trim() && !outflowCategories.includes(newOutflowCategory.trim())) {
      setOutflowCategories([...outflowCategories, newOutflowCategory.trim()]);
      setNewOutflowCategory('');
    }
  };

  const handleDeleteOutflowCategory = (index: number) => {
    setOutflowCategories(outflowCategories.filter((_, i) => i !== index));
  };

  const handleStartEditOutflow = (index: number) => {
    setEditingOutflowIndex(index);
    setEditingOutflowValue(outflowCategories[index]);
  };

  const handleSaveEditOutflow = () => {
    if (editingOutflowIndex !== null && editingOutflowValue.trim() && !outflowCategories.includes(editingOutflowValue.trim())) {
      const newCategories = [...outflowCategories];
      newCategories[editingOutflowIndex] = editingOutflowValue.trim();
      setOutflowCategories(newCategories);
      setEditingOutflowIndex(null);
      setEditingOutflowValue('');
    }
  };

  const handleCancelEditOutflow = () => {
    setEditingOutflowIndex(null);
    setEditingOutflowValue('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Configuración</h1>
      
      {/* Theme Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white">Tema de Apariencia</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cambiar entre modo claro y oscuro
          </p>
        </div>
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition"
        >
          {isDarkMode ? <SunIcon className="w-6 h-6 text-slate-800 dark:text-white"/> : <MoonIcon className="w-6 h-6 text-slate-800 dark:text-white"/>}
        </button>
      </div>

      {/* Currency Selection */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div className="mb-3">
          <h3 className="font-semibold text-slate-800 dark:text-white">Moneda</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Selecciona la moneda para mostrar los montos
          </p>
        </div>
        <select
          value={currencyCode}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.iso} value={currency.currency_code}>
              {currency.name} - {currency.currency_name} ({currency.currency_code})
            </option>
          ))}
        </select>
        <div className="mt-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500 dark:text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Los cambios se aplican automáticamente a toda la aplicación
          </p>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white">Activar Categorías</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Habilitar el campo de categoría en las transacciones
          </p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Categories List */}
      {enabled && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-white">Categorías</h3>
            <button
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 px-3 py-1 rounded-lg transition-colors"
            >
              {categoriesExpanded ? 'Compactar' : 'Expandir'}
              {categoriesExpanded ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          
          {categoriesExpanded && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inflow Categories Section */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <h4 className="font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                Categorías de Ventas
                <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  {inflowCategories.length}
                </span>
              </h4>
              
              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {inflowCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {editingInflowIndex === index ? (
                      <>
                        <input
                          type="text"
                          value={editingInflowValue}
                          onChange={(e) => setEditingInflowValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditInflow();
                            if (e.key === 'Escape') handleCancelEditInflow();
                          }}
                          className="flex-1 px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEditInflow}
                          className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                          title="Guardar"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEditInflow}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-slate-700 dark:text-slate-200">{category}</span>
                        <button
                          onClick={() => handleStartEditInflow(index)}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInflowCategory(index)}
                          className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newInflowCategory}
                  onChange={(e) => setNewInflowCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddInflowCategory()}
                  placeholder="Nueva categoría"
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <button
                  onClick={handleAddInflowCategory}
                  disabled={!newInflowCategory.trim() || inflowCategories.includes(newInflowCategory.trim())}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                >
                  <PlusIcon className="w-4 h-4" />
                  Agregar
                </button>
              </div>
            </div>

            {/* Outflow Categories Section */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <h4 className="font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                Categorías de Gastos
                <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
                  {outflowCategories.length}
                </span>
              </h4>
              
              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {outflowCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {editingOutflowIndex === index ? (
                      <>
                        <input
                          type="text"
                          value={editingOutflowValue}
                          onChange={(e) => setEditingOutflowValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditOutflow();
                            if (e.key === 'Escape') handleCancelEditOutflow();
                          }}
                          className="flex-1 px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEditOutflow}
                          className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                          title="Guardar"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEditOutflow}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-slate-700 dark:text-slate-200">{category}</span>
                        <button
                          onClick={() => handleStartEditOutflow(index)}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOutflowCategory(index)}
                          className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newOutflowCategory}
                  onChange={(e) => setNewOutflowCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOutflowCategory()}
                  placeholder="Nueva categoría"
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <button
                  onClick={handleAddOutflowCategory}
                  disabled={!newOutflowCategory.trim() || outflowCategories.includes(newOutflowCategory.trim())}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                >
                  <PlusIcon className="w-4 h-4" />
                  Agregar
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      )}
      
      {/* Info message */}
      <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-emerald-600 dark:text-emerald-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          Los cambios se guardan automáticamente
        </p>
      </div>
    </div>
  );
};
