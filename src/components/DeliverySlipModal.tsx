import React from 'react';
import { Order } from '../types';
import { formatINR, formatTime12H, getMoneyOwed } from '../utils/calculations';
import { X, Printer, CheckCircle2, Tag, School, Package } from 'lucide-react';

interface DeliverySlipModalProps {
  order: Order | null;
  onClose: () => void;
}

export const DeliverySlipModal: React.FC<DeliverySlipModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const balanceDue = getMoneyOwed(order);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none">
        {/* Header (Hidden when printing) */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-300" />
            <h3 className="font-bold text-sm">School Delivery Bag Tag</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Delivery Slip Card */}
        <div className="p-6 space-y-4 font-sans bg-white text-slate-900 border-2 border-dashed border-slate-400 m-4 rounded-xl print:m-0 print:border-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500">
                School 3D Print Lab
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                DELIVERY SLIP
              </h2>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500">Queue Slot</div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                #{order.slotNumber}
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Deliver To</span>
              <strong className="text-base text-slate-900 block font-bold">{order.customerName}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Class / Section</span>
              <strong className="text-base text-indigo-700 block font-bold">Class {order.classSection}</strong>
            </div>
          </div>

          {/* Product details */}
          <div className="space-y-1 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">3D Printed Item</span>
            <div className="text-base font-bold text-slate-900">
              {order.quantity > 1 ? `${order.quantity}x ` : ''}{order.productName}
            </div>
            {order.customName && (
              <div className="p-2 bg-indigo-50 border border-indigo-200 rounded text-xs font-mono font-bold text-indigo-900 mt-1">
                Custom Name: "{order.customName}"
              </div>
            )}
          </div>

          {/* Payment info */}
          <div className="p-3 rounded-lg border-2 text-xs space-y-1 font-mono font-bold flex items-center justify-between border-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Payment Status</span>
              <span className={`text-sm uppercase ${order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {order.paymentStatus}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">
                {balanceDue > 0 ? 'Collect Cash Due' : 'Total Price'}
              </span>
              <span className="text-base font-extrabold text-slate-900">
                {balanceDue > 0 ? formatINR(balanceDue) : formatINR(order.sellingPrice)}
              </span>
            </div>
          </div>

          {/* Delivery Checkoff box */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-slate-800 rounded"></div>
              <span>Handed to student in class</span>
            </div>
            <span>Paper Date: {order.orderDate}</span>
          </div>
        </div>

        {/* Footer actions (Hidden on print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Tag</span>
          </button>
        </div>
      </div>
    </div>
  );
};
