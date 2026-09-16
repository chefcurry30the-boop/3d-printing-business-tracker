import React from 'react';
import { OrderStatus, PaymentStatus } from '../types';
import { 
  Clock, 
  Layers, 
  Printer, 
  CheckCircle2, 
  PackageCheck, 
  XCircle,
  AlertCircle,
  Check
} from 'lucide-react';

export const StatusBadge: React.FC<{ status: OrderStatus; className?: string }> = ({ status, className = '' }) => {
  switch (status) {
    case 'Booked':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          Booked
        </span>
      );
    case 'Queued':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs ${className}`}>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Queued
        </span>
      );
    case 'Printing':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs ${className}`}>
          <Printer className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
          Printing
        </span>
      );
    case 'Ready':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Ready to Deliver
        </span>
      );
    case 'Delivered':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 ${className}`}>
          <PackageCheck className="w-3.5 h-3.5 text-emerald-700" />
          Delivered
        </span>
      );
    case 'Cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 line-through opacity-80 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          Cancelled
        </span>
      );
    default:
      return null;
  }
};

export const PaymentBadge: React.FC<{ 
  paymentStatus: PaymentStatus; 
  amountPaid?: number; 
  totalPrice?: number;
  className?: string;
}> = ({ paymentStatus, amountPaid = 0, totalPrice = 0, className = '' }) => {
  switch (paymentStatus) {
    case 'Paid':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <Check className="w-3 h-3 stroke-[3]" />
          Paid
        </span>
      );
    case 'Partially Paid':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}>
          <AlertCircle className="w-3 h-3 text-amber-600" />
          Partial (₹{amountPaid})
        </span>
      );
    case 'Unpaid':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Unpaid (₹{totalPrice})
        </span>
      );
    default:
      return null;
  }
};

export const SlotBadge: React.FC<{ slotNumber: number; isTop?: boolean }> = ({ slotNumber, isTop = false }) => {
  return (
    <div
      className={`inline-flex items-center justify-center font-mono font-bold rounded-lg px-2.5 py-1 border transition-all ${
        isTop
          ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs ring-2 ring-amber-300'
          : 'bg-slate-100 text-slate-800 border-slate-300'
      }`}
    >
      <span className="text-[10px] uppercase font-bold text-slate-600 mr-1">Slot</span>
      <span className="text-sm">#{slotNumber}</span>
    </div>
  );
};
