import React, { useState, useEffect } from 'react';
import { INPUT_BASE_CLASSES } from '../utils/constants';
import * as debtService from '../services/debtService';

interface DebtFormProps {
  mode: 'create' | 'edit';
  debtId?: string;
  onSave: () => void;
  onCancel: () => void;
}

export const DebtForm: React.FC<DebtFormProps> = ({ mode, debtId, onSave, onCancel }) => {
  const [type, setType] = useState<'receivable' | 'payable'>('receivable');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && debtId) {
      const debt = debtService.getDebtById(debtId);
      if (debt) {
        setType(debt.type);
        setCounterparty(debt.counterparty);
        setAmount(debt.amount.toString());
        setDescription(debt.description);
        setDueDate(debt.dueDate.split('T')[0]);
        setCategory(debt.category || '');
        setNotes(debt.notes || '');
      }
    }
  }, [mode, debtId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!counterparty.trim() || !amount || !description.trim() || !dueDate) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await debtService.createDebt(
          type,
          counterparty,
          amountNum,
          description,
          dueDate,
          category || undefined,
          notes || undefined
        );
      } else if (debtId) {
        await debtService.updateDebt(debtId, {
          type,
          counterparty,
          amount: amountNum,
          description,
          dueDate,
          category: category || undefined,
          notes: notes || undefined
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving debt:', error);
      alert('Error al guardar la deuda');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Tipo de Deuda *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('receivable')}
              className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                type === 'receivable'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Por Cobrar
            </button>
            <button
              type="button"
              onClick={() => setType('payable')}
              className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                type === 'payable'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Por Pagar
            </button>
          </div>
        </div>

        {/* Counterparty */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {type === 'receivable' ? 'Cliente' : 'Proveedor'} *
          </label>
          <input
            type="text"
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
            placeholder={type === 'receivable' ? 'Nombre del cliente' : 'Nombre del proveedor'}
            className={INPUT_BASE_CLASSES}
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Monto *
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={INPUT_BASE_CLASSES}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Descripción *
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Concepto de la deuda"
            className={INPUT_BASE_CLASSES}
            required
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Fecha de Vencimiento *
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={INPUT_BASE_CLASSES}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Categoría
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ej: Ventas a Crédito, Facturas Pendientes"
            className={INPUT_BASE_CLASSES}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Notas
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Información adicional..."
            rows={3}
            className={INPUT_BASE_CLASSES}
          />
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="flex-shrink-0 pt-6 px-6 pb-6 -mx-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 space-y-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg"
        >
          {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Deuda' : 'Actualizar Deuda'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-xl transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
