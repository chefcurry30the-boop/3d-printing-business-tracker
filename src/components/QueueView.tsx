import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { 
  calculateOrderCosts, 
  formatINR, 
  formatTime12H, 
  getMoneyCollected, 
  getOrderSortTimestamp 
} from '../utils/calculations';
import { StatusBadge, SlotBadge, PaymentBadge } from './StatusBadges';
import { 
  ListOrdered, 
  Printer, 
  CheckCircle2, 
  PackageCheck, 
  Clock, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  Info,
  Sparkles,
  AlertCircle,
  Play
} from 'lucide-react';

interface QueueViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onSwapTieBreaker: (orderAId: string, orderBId: string) => void;
  onOpenAddModal: () => void;
}

export const QueueView: React.FC<QueueViewProps> = ({
  orders,
  onSelectOrder,
  onUpdateStatus,
  onSwapTieBreaker,
  onOpenAddModal,
}) => {
  const [filterType, setFilterType] = useState<'active' | 'all' | 'ready' | 'delivered'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Orders are pre-sorted by slotNumber (chronological order date & time)
  const filteredOrders = orders.filter(order => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchClass = order.classSection.toLowerCase().includes(q);
      const matchProduct = order.productName.toLowerCase().includes(q);
      const matchCustom = (order.customName || '').toLowerCase().includes(q);
      const matchSlot = `slot #${order.slotNumber} #${order.slotNumber} ${order.slotNumber}`.toLowerCase().includes(q);
      if (!matchName && !matchClass && !matchProduct && !matchCustom && !matchSlot) {
        return false;
      }
    }

    if (filterType === 'active') {
      return order.status === 'Queued' || order.status === 'Printing' || order.status === 'Booked';
    }
    if (filterType === 'ready') {
      return order.status === 'Ready';
    }
    if (filterType === 'delivered') {
      return order.status === 'Delivered';
    }
    return true; // 'all'
  });

  // Identify next in line among queued/booked
  const activePrinting = orders.find(o => o.status === 'Printing');
  const nextInQueue = orders.find(o => o.status === 'Queued' || o.status === 'Booked');

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Header & Explanation */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <ListOrdered className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  3D Print Queue & Slots
                </h2>
                <p className="text-xs text-slate-500">
                  Strictly ordered by Paper Order Date & Time (Earliest customer gets earliest slot)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              + Add Paper Order
            </button>
          </div>
        </div>

        {/* Paper order time guarantee note */}
        <div className="mt-4 p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Queue Rule:</strong> Slot numbers are calculated from the original paper order timestamp. Entering orders hours later at home will NOT distort the queue priority!
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'active'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Queue ({orders.filter(o => o.status === 'Queued' || o.status === 'Printing' || o.status === 'Booked').length})
          </button>
          <button
            onClick={() => setFilterType('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'ready'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ready to Deliver ({orders.filter(o => o.status === 'Ready').length})
          </button>
          <button
            onClick={() => setFilterType('delivered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'delivered'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Delivered ({orders.filter(o => o.status === 'Delivered').length})
          </button>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Slots ({orders.length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search queue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Queue List Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
            <ListOrdered className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">No orders in this queue view</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery ? 'Try changing your search keywords.' : 'Add your first paper orders to see the automatic queue slot calculation.'}
            </p>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
            >
              + Enter Paper Order
            </button>
          </div>
        ) : (
          filteredOrders.map((order, idx) => {
            const costs = calculateOrderCosts(order.filamentGrams, order.printTimeHours, order.sellingPrice);
            const isPrinting = order.status === 'Printing';
            const isNextUp = !isPrinting && nextInQueue?.id === order.id && (order.status === 'Queued' || order.status === 'Booked');
            
            // Check if adjacent order has exact same date & time for tiebreaker adjustment
            const prevOrder = idx > 0 ? filteredOrders[idx - 1] : null;
            const nextOrder = idx < filteredOrders.length - 1 ? filteredOrders[idx + 1] : null;
            const hasSameTimeWithPrev = prevOrder && getOrderSortTimestamp(prevOrder.orderDate, prevOrder.orderTime) === getOrderSortTimestamp(order.orderDate, order.orderTime);
            const hasSameTimeWithNext = nextOrder && getOrderSortTimestamp(nextOrder.orderDate, nextOrder.orderTime) === getOrderSortTimestamp(order.orderDate, order.orderTime);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all relative ${
                  isPrinting
                    ? 'border-blue-500 ring-2 ring-blue-300 shadow-md bg-gradient-to-r from-blue-50/50 via-white to-white'
                    : isNextUp
                    ? 'border-amber-400 ring-2 ring-amber-200 shadow-sm bg-gradient-to-r from-amber-50/40 via-white to-white'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Visual Priority Tag */}
                {isPrinting && (
                  <div className="absolute -top-3 left-6 bg-blue-600 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>Currently Printing</span>
                  </div>
                )}
                {isNextUp && (
                  <div className="absolute -top-3 left-6 bg-amber-500 text-amber-950 text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-950" />
                    <span>Next Up In Line</span>
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-1">
                  {/* Left: Slot Number + Customer & Order Details */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <SlotBadge slotNumber={order.slotNumber} isTop={isPrinting || isNextUp} />
                      
                      {/* Tiebreaker adjust buttons if orders ordered at same time */}
                      {(hasSameTimeWithPrev || hasSameTimeWithNext) && (
                        <div className="flex flex-col items-center mt-1">
                          <span className="text-[9px] text-amber-800 font-bold bg-amber-100 px-1 rounded">Same Time</span>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {hasSameTimeWithPrev && (
                              <button
                                title="Move up in tie-breaker"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSwapTieBreaker(order.id, prevOrder.id);
                                }}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                            )}
                            {hasSameTimeWithNext && (
                              <button
                                title="Move down in tie-breaker"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSwapTieBreaker(order.id, nextOrder.id);
                                }}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-slate-900">
                          {order.customerName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          Class {order.classSection}
                        </span>
                        <StatusBadge status={order.status} />
                        <PaymentBadge 
                          paymentStatus={order.paymentStatus} 
                          amountPaid={order.amountPaid}
                          totalPrice={order.sellingPrice}
                        />
                      </div>

                      {/* Product Name & Inscription */}
                      <div className="text-sm text-slate-800 font-semibold flex items-center gap-2 flex-wrap">
                        <span>{order.quantity > 1 ? `${order.quantity}x ` : ''}{order.productName}</span>
                        {order.customName && (
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            Custom Name: "{order.customName}"
                          </span>
                        )}
                      </div>

                      {/* Manufacturing & Paper Order Metadata */}
                      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap pt-0.5">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                          🕒 Print Time: <strong>{order.printTimeHours} hrs</strong>
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                          ⚖️ Filament: <strong>{order.filamentGrams}g</strong>
                        </span>
                        <span className="text-slate-500 font-medium">
                          📝 Paper Date: <strong>{order.orderDate}</strong> at <strong>{formatTime12H(order.orderTime)}</strong>
                        </span>
                      </div>

                      {order.notes && (
                        <p className="text-xs text-slate-500 italic bg-amber-50/50 px-2 py-1 rounded border border-amber-100 mt-1 max-w-xl">
                          Note: {order.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Cost Breakdown & Quick Action Buttons */}
                  <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <div className="text-base font-extrabold text-slate-900 font-mono">
                        {formatINR(order.sellingPrice)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Owner: <strong className="text-amber-800">{formatINR(costs.ownerPayout)}</strong> | Profit: <strong className="text-emerald-700">+{formatINR(costs.profit)}</strong>
                      </div>
                    </div>

                    {/* Quick Status Stepper Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {order.status === 'Booked' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'Queued')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Queue
                        </button>
                      )}
                      
                      {(order.status === 'Queued' || order.status === 'Booked') && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'Printing')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Print</span>
                        </button>
                      )}

                      {order.status === 'Printing' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'Ready')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Ready</span>
                        </button>
                      )}

                      {order.status === 'Ready' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'Delivered')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Deliver</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSelectOrder(order)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
