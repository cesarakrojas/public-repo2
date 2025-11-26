import React from 'react';
import type { Transaction } from '../types';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { CloseIcon, ArrowUpIcon, ArrowDownIcon, PrinterIcon } from './icons';

interface TransactionDetailViewProps {
  transaction: Transaction;
  onClose: () => void;
  onEdit: () => void;
  currencyCode?: string;
}

export const TransactionDetailView: React.FC<TransactionDetailViewProps> = ({
  transaction,
  onClose,
  onEdit,
  currencyCode
}) => {
  const handlePrintReceipt = () => {
    // Create a printable receipt
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo - ${transaction.description}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              max-width: 300px;
              margin: 20px auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
            }
            .label {
              font-weight: bold;
            }
            .amount {
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
              padding: 15px;
              border: 2px solid #000;
            }
            .footer {
              text-align: center;
              border-top: 2px dashed #000;
              padding-top: 10px;
              margin-top: 15px;
              font-size: 12px;
            }
            .type-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-weight: bold;
              ${transaction.type === 'inflow' 
                ? 'background-color: #d1fae5; color: #065f46;' 
                : 'background-color: #fee2e2; color: #991b1b;'
              }
            }
            .items-section {
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 10px 0;
              margin: 15px 0;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin: 6px 0;
              font-size: 14px;
            }
            .item-name {
              flex: 1;
            }
            .item-variant {
              font-size: 12px;
              color: #666;
              margin-left: 4px;
            }
            .item-qty {
              margin: 0 8px;
            }
            .item-price {
              text-align: right;
              min-width: 70px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RECIBO DE ${transaction.type === 'inflow' ? 'VENTA' : 'GASTO'}</h2>
            <p>ID: ${transaction.id}</p>
          </div>
          
          <div class="row">
            <span class="label">Tipo:</span>
            <span class="type-badge">${transaction.type === 'inflow' ? 'Venta' : 'Gasto'}</span>
          </div>
          
          <div class="row">
            <span class="label">Fecha:</span>
            <span>${formatDate(transaction.timestamp)}</span>
          </div>
          
          <div class="row">
            <span class="label">Hora:</span>
            <span>${formatTime(transaction.timestamp)}</span>
          </div>
          
          ${transaction.items && transaction.items.length > 0 ? `
            <div class="items-section">
              <div style="font-weight: bold; margin-bottom: 8px;">PRODUCTOS:</div>
              ${transaction.items.map(item => `
                <div class="item-row">
                  <span class="item-name">
                    ${item.productName}
                    ${item.variantName ? `<span class="item-variant">(${item.variantName})</span>` : ''}
                  </span>
                  <span class="item-qty">x${item.quantity}</span>
                  <span class="item-price">${formatCurrency(item.price * item.quantity, currencyCode)}</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="row">
              <span class="label">Descripción:</span>
              <span>${transaction.description}</span>
            </div>
          `}
          
          ${transaction.category ? `
            <div class="row">
              <span class="label">Categoría:</span>
              <span>${transaction.category}</span>
            </div>
          ` : ''}
          
          ${transaction.paymentMethod ? `
            <div class="row">
              <span class="label">Método de Pago:</span>
              <span>${transaction.paymentMethod}</span>
            </div>
          ` : ''}
          
          <div class="amount">
            TOTAL: ${formatCurrency(transaction.amount, currencyCode)}
          </div>
          
          <div class="footer">
            <p>Generado el ${formatDate(new Date().toISOString())}</p>
            <p>a las ${formatTime(new Date().toISOString())}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="w-full h-full max-w-4xl mx-auto flex items-stretch">
      <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-t-3xl w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Detalle de Transacción
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
          {/* Transaction Type Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-lg ${
              transaction.type === 'inflow'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
            }`}>
              {transaction.type === 'inflow' ? (
                <>
                  <ArrowUpIcon className="w-5 h-5" />
                  <span>Venta</span>
                </>
              ) : (
                <>
                  <ArrowDownIcon className="w-5 h-5" />
                  <span>Gasto</span>
                </>
              )}
            </div>
          </div>

          {/* Amount Display */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 mb-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Monto</p>
            <p className={`text-4xl font-bold ${
              transaction.type === 'inflow'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(transaction.amount, currencyCode)}
            </p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            {/* ID */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">ID de Transacción</p>
              <p className="text-sm font-mono text-slate-800 dark:text-slate-200">{transaction.id}</p>
            </div>

            {/* Description */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Descripción</p>
              <p className="text-base text-slate-800 dark:text-slate-200">{transaction.description}</p>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Fecha</p>
                <p className="text-base text-slate-800 dark:text-slate-200">{formatDate(transaction.timestamp)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Hora</p>
                <p className="text-base text-slate-800 dark:text-slate-200">{formatTime(transaction.timestamp)}</p>
              </div>
            </div>

            {/* Category */}
            {transaction.category && (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Categoría</p>
                <p className="text-base text-slate-800 dark:text-slate-200">{transaction.category}</p>
              </div>
            )}

            {/* Payment Method */}
            {transaction.paymentMethod && (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Método de Pago</p>
                <p className="text-base text-slate-800 dark:text-slate-200">{transaction.paymentMethod}</p>
              </div>
            )}

            {/* Product Items (for sales with items) */}
            {transaction.items && transaction.items.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Productos</p>
                <div className="space-y-2">
                  {transaction.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
                      <div className="flex-1">
                        <p className="text-base font-medium text-slate-800 dark:text-slate-200">{item.productName}</p>
                        {item.variantName && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">{item.variantName}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">x{item.quantity}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{formatCurrency(item.price * item.quantity, currencyCode)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="flex-shrink-0 pt-6 px-6 pb-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
          {/* Print Receipt Button */}
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
          >
            <PrinterIcon className="w-5 h-5" />
            Generar Recibo
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={onEdit}
            className="w-full bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Editar Transacción
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
