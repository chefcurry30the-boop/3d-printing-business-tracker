import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { calculateOrderCosts, formatINR } from '../utils/calculations';
import { 
  X, 
  Save, 
  Calculator, 
  Clock, 
  Calendar, 
  User, 
  GraduationCap, 
  Tag 
} from 'lucide-react';

interface EditOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrder: Order) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSave,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [classSection, setClassSection] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderTime, setOrderTime] = useState('');
  const [productName, setProductName] = useState('');
  const [customName, setCustomName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrintTimeHours, setUnitPrintTimeHours] = useState<number>(1);
  const [unitFilamentGrams, setUnitFilamentGrams] = useState<number>(10);
  const [unitSellingPrice, setUnitSellingPrice] = useState<number>(50);
  const [printTimeHours, setPrintTimeHours] = useState<number>(1);
  const [filamentGrams, setFilamentGrams] = useState<number>(10);
  const [sellingPrice, setSellingPrice] = useState<number>(50);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Unpaid');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [status, setStatus] = useState<OrderStatus>('Queued');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (order) {
      const q = Math.max(1, order.quantity || 1);
      setCustomerName(order.customerName);
      setClassSection(order.classSection);
      setOrderDate(order.orderDate);
      setOrderTime(order.orderTime);
      setProductName(order.productName);
      setCustomName(order.customName || '');
      setQuantity(q);
      setUnitPrintTimeHours(Number((order.printTimeHours / q).toFixed(2)));
      setUnitFilamentGrams(Math.round(order.filamentGrams / q));
      setUnitSellingPrice(Math.round(order.sellingPrice / q));
      setPrintTimeHours(order.printTimeHours);
      setFilamentGrams(order.filamentGrams);
      setSellingPrice(order.sellingPrice);
      setPaymentStatus(order.paymentStatus);
      setAmountPaid(order.amountPaid || 0);
      setStatus(order.status);
      setNotes(order.notes || '');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const costs = calculateOrderCosts(filamentGrams, printTimeHours, sellingPrice);

  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(1, Math.floor(newQty) || 1);
    setQuantity(validQty);
    
    const newFilament = Math.round(unitFilamentGrams * validQty);
    const newHours = Number((unitPrintTimeHours * validQty).toFixed(2));
    const newPrice = Math.round(unitSellingPrice * validQty);

    setFilamentGrams(newFilament);
    setPrintTimeHours(newHours);
    setSellingPrice(newPrice);

    if (paymentStatus === 'Paid') {
      setAmountPaid(newPrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !productName.trim()) {
      alert('Please fill customer name and product name');
      return;
    }

    const updated: Order = {
      ...order,
      customerName: customerName.trim(),
      classSection: classSection.trim(),
      orderDate: orderDate.trim(),
      orderTime: orderTime.trim(),
      productName: productName.trim(),
      customName: customName.trim() || undefined,
      quantity: Number(quantity) || 1,
      printTimeHours: Number(printTimeHours) || 0,
      filamentGrams: Number(filamentGrams) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      paymentStatus,
      amountPaid: paymentStatus === 'Paid' ? Number(sellingPrice) : paymentStatus === 'Unpaid' ? 0 : Number(amountPaid),
      status,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
              Edit Order (Slot #{order.slotNumber})
            </h3>
            <p className="text-xs text-indigo-200">
              Costs, payout, and profit recalculate instantly
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Customer & Class */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class / Section</label>
              <input
                type="text"
                required
                value={classSection}
                onChange={(e) => setClassSection(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Paper Timestamps */}
          <div className="grid grid-cols-2 gap-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
            <div>
              <label className="block text-[11px] font-bold text-amber-900 mb-1">Paper Order Date</label>
              <input
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-amber-900 mb-1">Paper Order Time</label>
              <input
                type="text"
                required
                value={orderTime}
                onChange={(e) => setOrderTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg font-medium"
              />
            </div>
          </div>

          {/* Product & Custom Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product</label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Custom Inscription</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Quantity</label>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
                  className="w-full py-1 text-xs font-mono text-center font-bold focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Print Hours</label>
              <input
                type="number"
                step="0.1"
                value={printTimeHours}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPrintTimeHours(val);
                  setUnitPrintTimeHours(quantity > 0 ? Number((val / quantity).toFixed(2)) : val);
                }}
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg font-mono text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Filament (g)</label>
              <input
                type="number"
                step="1"
                value={filamentGrams}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setFilamentGrams(val);
                  setUnitFilamentGrams(quantity > 0 ? Math.round(val / quantity) : val);
                }}
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg font-mono text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSellingPrice(val);
                  setUnitSellingPrice(quantity > 0 ? Math.round(val / quantity) : val);
                  if (paymentStatus === 'Paid') setAmountPaid(val);
                }}
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg font-mono text-center font-bold text-indigo-700"
              />
            </div>
          </div>

          {/* Live Recalculated Card */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Filament ({filamentGrams}g): <strong>{formatINR(costs.filamentCost)}</strong></span>
              <span>Power ({printTimeHours}h = {costs.electricityUnits}u @ ₹9/u): <strong className="text-amber-300">{formatINR(costs.electricityCost)}</strong></span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold">
              <span className="text-amber-400">Give Owner: {formatINR(costs.ownerPayout)}</span>
              <span className="text-emerald-400">Profit: {formatINR(costs.profit)}</span>
            </div>
          </div>

          {/* Status & Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-semibold"
              >
                <option value="Booked">Booked</option>
                <option value="Queued">Queued</option>
                <option value="Printing">Printing</option>
                <option value="Ready">Ready</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-semibold"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          {paymentStatus === 'Partially Paid' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount Paid (₹)</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg font-mono font-bold"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
