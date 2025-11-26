import React from 'react';
import type { DebtEntry } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CloseIcon, CheckCircleIcon, PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from './icons';

interface DebtDetailViewProps {
  debt: DebtEntry;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAsPaid: () => void;
  currencyCode?: string;
}

export const DebtDetailView: React.FC<DebtDetailViewProps> = ({
  debt,
  onClose,
  onEdit,
  onDelete,
  onMarkAsPaid,
  currencyCode
}) => {
  const getStatusColor = () => {
    switch (debt.status) {
      case 'paid': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50';
      case 'overdue': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50';
      case 'pending': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50';
    }
  };

  const getStatusLabel = () => {
    switch (debt.status) {
      case 'paid': return 'Pagado';
      case 'overdue': return 'Vencido';
      case 'pending': return 'Pendiente';
      default: return debt.status;
    }
  };

  const getTypeColor = () => {
    return debt.type === 'receivable' 
      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50'
      : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50';
  };

  const getTypeLabel = () => {
    return debt.type === 'receivable' ? 'Por Cobrar' : 'Por Pagar';
  };

  return (
    <div className="w-full h-full max-w-4xl mx-auto flex items-stretch">
      <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-t-3xl w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Detalle de Deuda
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
          {/* Type and Status Badges */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-lg ${getTypeColor()}`}>
              {debt.type === 'receivable' ? (
                <>
                  <ArrowUpIcon className="w-5 h-5" />
                  <span>{getTypeLabel()}</span>
                </>
              ) : (
                <>
                  <ArrowDownIcon className="w-5 h-5" />
                  <span>{getTypeLabel()}</span>
                </>
              )}
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold text-lg ${getStatusColor()}`}>
              {getStatusLabel()}
            </div>
          </div>

          {/* Amount Display */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 mb-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Monto</p>
            <p className={`text-4xl font-bold ${
              debt.type === 'receivable'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(debt.amount, currencyCode)}
            </p>
          </div>

          {/* Debt Details */}
          <div className="space-y-4">
            {/* Counterparty */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                {debt.type === 'receivable' ? 'Cliente' : 'Proveedor'}
              </p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{debt.counterparty}</p>
            </div>

            {/* Description */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Descripción</p>
              <p className="text-base text-slate-800 dark:text-slate-200">{debt.description}</p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Fecha de Vencimiento</p>
                <p className="text-base text-slate-800 dark:text-slate-200">{formatDate(debt.dueDate)}</p>
                {debt.status === 'overdue' && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">¡Vencido!</p>
                )}
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Fecha de Creación</p>
                <p className="text-base text-slate-800 dark:text-slate-200">{formatDate(debt.createdAt)}</p>
              </div>
            </div>

            {/* Category */}
            {debt.category && (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Categoría</p>
                <p className="text-base text-slate-800 dark:text-slate-200">{debt.category}</p>
              </div>
            )}

            {/* Notes */}
            {debt.notes && (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Notas</p>
                <p className="text-base text-slate-800 dark:text-slate-200">{debt.notes}</p>
              </div>
            )}

            {/* Payment Info (if paid) */}
            {debt.status === 'paid' && debt.paidAt && (
              <div className="bg-emerald-50 dark:bg-emerald-900/50 rounded-xl p-4">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Fecha de Pago</p>
                <p className="text-base text-emerald-800 dark:text-emerald-200">{formatDate(debt.paidAt)}</p>
                {debt.linkedTransactionId && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                    ID de Transacción: {debt.linkedTransactionId}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="flex-shrink-0 pt-6 px-6 pb-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
          {/* Mark as Paid Button (only if not paid) */}
          {debt.status !== 'paid' && (
            <button
              type="button"
              onClick={onMarkAsPaid}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-emerald-500/30"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Marcar como Pagado
            </button>
          )}

          {/* Edit Button (only if not paid) */}
          {debt.status !== 'paid' && (
            <button
              type="button"
              onClick={onEdit}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
            >
              <PencilIcon className="w-5 h-5" />
              Editar Deuda
            </button>
          )}

          {/* Delete Button */}
          <button
            type="button"
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-red-500/30"
          >
            <TrashIcon className="w-5 h-5" />
            Eliminar Deuda
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
