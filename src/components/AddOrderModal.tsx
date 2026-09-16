import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus, ProductPreset } from '../types';
import { calculateOrderCosts, formatINR } from '../utils/calculations';
import { DEFAULT_PRODUCT_PRESETS } from '../utils/storage';
import { 
  X, 
  Plus, 
  Sparkles, 
  Clock, 
  Calendar, 
  User, 
  GraduationCap, 
  Layers, 
  DollarSign, 
  FileText,
  Calculator,
  Save,
  Zap,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (newOrder: Omit<Order, 'id' | 'orderNumber' | 'slotNumber'>, keepOpen?: boolean) => void;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  isOpen,
  onClose,
  onAddOrder,
}) => {
  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [classSection, setClassSection] = useState('');
  const [orderDate, setOrderDate] = useState(todayStr);
  const [orderTime, setOrderTime] = useState('10:00 AM');
  const [productName, setProductName] = useState('');
  const [customName, setCustomName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrintTimeHours, setUnitPrintTimeHours] = useState<number>(1.0);
  const [unitFilamentGrams, setUnitFilamentGrams] = useState<number>(20);
  const [unitSellingPrice, setUnitSellingPrice] = useState<number>(50);
  const [printTimeHours, setPrintTimeHours] = useState<number>(1.0);
  const [filamentGrams, setFilamentGrams] = useState<number>(20);
  const [sellingPrice, setSellingPrice] = useState<number>(50);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Unpaid');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [status, setStatus] = useState<OrderStatus>('Queued');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Live calculation
  const costs = calculateOrderCosts(filamentGrams, printTimeHours, sellingPrice);

  // Apply preset
  const handleApplyPreset = (preset: ProductPreset) => {
    setProductName(preset.name);
    setUnitFilamentGrams(preset.defaultGrams);
    setUnitPrintTimeHours(preset.defaultHours);
    setUnitSellingPrice(preset.defaultPrice);
    
    // Scale to current quantity
    const qty = Math.max(1, quantity);
    setFilamentGrams(preset.defaultGrams * qty);
    setPrintTimeHours(Number((preset.defaultHours * qty).toFixed(2)));
    const newTotal = preset.defaultPrice * qty;
    setSellingPrice(newTotal);
    if (paymentStatus === 'Paid') {
      setAmountPaid(newTotal);
    }
  };

  // Handle Quantity Change (scales total specs & profit proportionally)
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
    } else if (paymentStatus === 'Partially Paid' && amountPaid > 0) {
      // Keep existing or proportionally update
    }
  };

  const handleQuickTime = (time: string) => {
    setOrderTime(time);
  };

  const handlePaymentStatusChange = (newStatus: PaymentStatus) => {
    setPaymentStatus(newStatus);
    if (newStatus === 'Paid') {
      setAmountPaid(sellingPrice);
    } else if (newStatus === 'Unpaid') {
      setAmountPaid(0);
    } else if (newStatus === 'Partially Paid' && amountPaid === 0) {
      setAmountPaid(Math.floor(sellingPrice / 2));
    }
  };

  const handleSubmit = (keepOpen: boolean = false) => {
    if (!customerName.trim()) {
      alert('Please enter Customer Name from the paper order.');
      return;
    }
    if (!productName.trim()) {
      alert('Please enter Product / Item name.');
      return;
    }

    const orderPayload: Omit<Order, 'id' | 'orderNumber' | 'slotNumber'> = {
      customerName: customerName.trim(),
      classSection: classSection.trim(),
      orderDate: orderDate || todayStr,
      orderTime: orderTime || '10:00 AM',
      enteredAt: new Date().toISOString(),
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
    };

    onAddOrder(orderPayload, keepOpen);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      // Ignore if not loaded
    }

    if (keepOpen) {
      // Clear customer-specific fields for the next paper slip, keep Date & Product preset handy
      setCustomerName('');
      setCustomName('');
      setNotes('');
      setPaymentStatus('Unpaid');
      setAmountPaid(0);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
              <FileText className="w-4 h-4 text-indigo-200" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
                Enter Paper Order
              </h3>
              <p className="text-xs text-indigo-200">
                Enter original school paper order date & time
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

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Presets for School Prints */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Quick Fill School Product Presets</span>
              </label>
              <span className="text-[11px] text-slate-500">1-tap auto fill</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              {DEFAULT_PRODUCT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 border transition-all cursor-pointer flex items-center gap-1.5 ${
                    productName === preset.name
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{preset.icon}</span>
                  <span>{preset.name}</span>
                  <span className="opacity-75 font-mono text-[10px]">(₹{preset.defaultPrice})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Customer Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Class / Section <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={classSection}
                  onChange={(e) => setClassSection(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Paper Timestamps (CRITICAL: Manual Entry from Paper, NOT App Time) */}
          <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Original Paper Order Timestamp (Determines Queue Slot)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                  Order Date on Paper
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                  Order Time on Paper
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={orderTime}
                    onChange={(e) => setOrderTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Quick School Time Shortcuts */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-amber-800 font-medium mr-1">School Timings:</span>
              {['10:05 AM (Break)', '10:20 AM (Recess)', '12:30 PM (Lunch)', '02:15 PM (Dispersal)'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleQuickTime(t.split(' ')[0] + ' ' + t.split(' ')[1])}
                  className="px-2 py-0.5 rounded text-[11px] bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-medium transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Product Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product / Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Name Inscription (Optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Section 4: Specifications (Filament, Time, Quantity, Price) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Quantity
                </label>
                <span className="text-[10px] text-indigo-600 font-semibold">
                  Multiplies specs
                </span>
              </div>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
                  className="w-full py-2 text-sm bg-transparent font-mono text-center font-bold focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-[10px] text-slate-500 text-center block mt-0.5">
                {quantity} {quantity === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Print Time (Hours)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={printTimeHours}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPrintTimeHours(val);
                  setUnitPrintTimeHours(quantity > 0 ? Number((val / quantity).toFixed(2)) : val);
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-mono text-center font-bold"
              />
              <span className="text-[10px] text-slate-500 block text-center mt-0.5">
                {quantity > 1 ? `${unitPrintTimeHours}h / item` : 'Total run time'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Filament (Grams)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={filamentGrams}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setFilamentGrams(val);
                  setUnitFilamentGrams(quantity > 0 ? Math.round(val / quantity) : val);
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-mono text-center font-bold"
              />
              <span className="text-[10px] text-slate-500 block text-center mt-0.5">
                {quantity > 1 ? `${unitFilamentGrams}g / item` : 'Total weight'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Selling Price (₹)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={sellingPrice}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSellingPrice(val);
                  setUnitSellingPrice(quantity > 0 ? Math.round(val / quantity) : val);
                  if (paymentStatus === 'Paid') setAmountPaid(val);
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-mono text-center font-extrabold text-indigo-700"
              />
              <span className="text-[10px] text-slate-500 block text-center mt-0.5 font-medium">
                {quantity > 1 ? `₹${unitSellingPrice} / item` : 'Total to collect'}
              </span>
            </div>
          </div>

          {/* Section 5: Realtime Automatic Calculation Box */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-800/80 pb-2">
              <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                Automatic Cost & Profit Breakdown
              </span>
              <span className="text-xs text-indigo-300">₹9/unit · ₹45/24h</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 block">Filament Cost:</span>
                <span className="text-[11px] text-slate-400 block">{filamentGrams}g × ₹1.00</span>
                <strong className="text-sm font-mono text-white">{formatINR(costs.filamentCost)}</strong>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 block">Electricity Cost:</span>
                <span className="text-[11px] text-slate-400 block">{costs.electricityUnits}u × ₹9 ({printTimeHours}h)</span>
                <strong className="text-sm font-mono text-amber-300">{formatINR(costs.electricityCost)}</strong>
              </div>

              <div className="space-y-0.5">
                <span className="text-amber-200 font-semibold block">Give Printer Owner:</span>
                <span className="text-[11px] text-slate-400 block">Filament + Electricity</span>
                <strong className="text-sm font-mono text-amber-400 font-extrabold">{formatINR(costs.ownerPayout)}</strong>
              </div>

              <div className="space-y-0.5">
                <span className="text-emerald-300 font-semibold block">Money Left (Profit):</span>
                <span className="text-[11px] text-slate-400 block">Price − Costs</span>
                <strong className="text-base font-mono text-emerald-400 font-extrabold">{formatINR(costs.profit)}</strong>
              </div>
            </div>
          </div>

          {/* Section 6: Payment & Initial Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Status
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Unpaid', 'Partially Paid', 'Paid'] as PaymentStatus[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePaymentStatusChange(p)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                      paymentStatus === p
                        ? p === 'Paid'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : p === 'Partially Paid'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                          : 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {paymentStatus === 'Partially Paid' && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Amount Received: ₹</span>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 text-xs border border-amber-300 rounded font-mono font-bold"
                  />
                  <span className="text-xs text-rose-600 font-medium">
                    (Remaining: ₹{Math.max(0, sellingPrice - amountPaid)})
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Queued">Queued (Default for printing line)</option>
                <option value="Booked">Booked (Logged paper note)</option>
                <option value="Printing">Printing (Currently on bed)</option>
                <option value="Ready">Ready (Printed and finished)</option>
              </select>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Footer Actions: High speed data entry buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-save-and-add-another"
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              Save & Add Next Paper Slip
            </button>

            <button
              id="btn-save-order"
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-200 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
