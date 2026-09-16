import React from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { 
  calculateOrderCosts, 
  formatINR, 
  formatTime12H, 
  getMoneyCollected, 
  getMoneyOwed 
} from '../utils/calculations';
import { StatusBadge, SlotBadge, PaymentBadge } from './StatusBadges';
import { 
  X, 
  Edit3, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  PackageCheck, 
  XCircle, 
  Tag, 
  Clock, 
  Calendar, 
  DollarSign, 
  Zap, 
  Layers, 
  FileText,
  AlertCircle,
  Receipt,
  User,
  GraduationCap
} from 'lucide-react';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdatePayment: (orderId: string, status: PaymentStatus, amountPaid?: number) => void;
  onPrintSlip: (order: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
  onUpdatePayment,
  onPrintSlip,
}) => {
  if (!order) return null;

  const costs = calculateOrderCosts(order.filamentGrams, order.printTimeHours, order.sellingPrice);
  const collected = getMoneyCollected(order);
  const owed = getMoneyOwed(order);

  const handleStatusClick = (newStatus: OrderStatus) => {
    onUpdateStatus(order.id, newStatus);
  };

  const handlePaymentClick = (newPayStatus: PaymentStatus) => {
    let newPaid = 0;
    if (newPayStatus === 'Paid') {
      newPaid = order.sellingPrice;
    } else if (newPayStatus === 'Partially Paid') {
      newPaid = order.amountPaid > 0 ? order.amountPaid : Math.floor(order.sellingPrice / 2);
    }
    onUpdatePayment(order.id, newPayStatus, newPaid);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SlotBadge slotNumber={order.slotNumber} isTop={order.status === 'Printing' || order.status === 'Queued'} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
                  {order.customerName}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/20 text-white">
                  Class {order.classSection}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Paper Order: {order.orderDate} at {formatTime12H(order.orderTime)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Bar with Instant Clickers */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">Change Order Status:</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
              {(['Booked', 'Queued', 'Printing', 'Ready', 'Delivered', 'Cancelled'] as OrderStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusClick(st)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all border text-center ${
                    order.status === st
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Product & Inscription Card */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Details</h4>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-bold text-slate-900">
                  {order.quantity > 1 ? `${order.quantity}x ` : ''}{order.productName}
                </div>
                {order.customName && (
                  <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200 inline-block mt-1">
                    Custom Name on Print: "{order.customName}"
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Selling Price</span>
                <span className="text-lg font-extrabold text-slate-900 font-mono">{formatINR(order.sellingPrice)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div>🕒 Print Time: <strong>{order.printTimeHours} hours</strong></div>
              <div>⚖️ Filament Used: <strong>{order.filamentGrams} grams</strong></div>
            </div>

            {order.notes && (
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                <strong>Notes from paper:</strong> {order.notes}
              </div>
            )}
          </div>

          {/* Financial Breakdown (Exact Formulas) */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center justify-between">
              <span>Financial & Cost Breakdown</span>
              <span className="text-[10px] text-slate-400 font-mono">School Formula</span>
            </h4>

            <div className="space-y-2 text-xs divide-y divide-slate-800">
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-300">
                  Filament Cost <span className="text-[11px] text-slate-400">({order.filamentGrams}g × ₹1.00)</span>
                </span>
                <span className="font-mono font-bold">{formatINR(costs.filamentCost)}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-300">
                  Electricity Cost <span className="text-[11px] text-slate-400">({order.printTimeHours}h = {costs.electricityUnits}u @ ₹9/u | ₹45/24h)</span>
                </span>
                <span className="font-mono font-bold text-amber-300">{formatINR(costs.electricityCost)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 text-amber-300 font-semibold">
                <span>
                  Total Amount to Give Printer Owner
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">{formatINR(costs.ownerPayout)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 text-emerald-400 font-bold text-sm">
                <span>
                  Money Left Over (Business Profit)
                </span>
                <span className="font-mono font-extrabold text-base text-emerald-300">{formatINR(costs.profit)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Bar */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">Payment Tracking:</span>
              <PaymentBadge paymentStatus={order.paymentStatus} amountPaid={order.amountPaid} totalPrice={order.sellingPrice} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handlePaymentClick('Paid')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  order.paymentStatus === 'Paid'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Mark Paid ({formatINR(order.sellingPrice)})
              </button>
              <button
                onClick={() => handlePaymentClick('Partially Paid')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  order.paymentStatus === 'Partially Paid'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Partial
              </button>
              <button
                onClick={() => handlePaymentClick('Unpaid')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  order.paymentStatus === 'Unpaid'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Unpaid (₹0)
              </button>
            </div>

            {order.paymentStatus === 'Partially Paid' && (
              <div className="text-xs text-slate-600 flex justify-between pt-1">
                <span>Collected: <strong className="text-emerald-700">{formatINR(order.amountPaid)}</strong></span>
                <span>Balance Due: <strong className="text-rose-600">{formatINR(owed)}</strong></span>
              </div>
            )}
          </div>

          {/* Audit Timestamps */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
            <span>Logged in app: {new Date(order.enteredAt).toLocaleString()}</span>
            <span>Slot ID: #{order.slotNumber} (Order #{order.orderNumber})</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(order.id)}
              className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={() => onPrintSlip(order)}
              className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Delivery Tag</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(order)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
