import React, { useState, useMemo } from 'react';
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
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  SlidersHorizontal, 
  Check, 
  RotateCcw, 
  Download,
  Calendar,
  Layers
} from 'lucide-react';

interface OrdersListProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onOpenAddModal: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdatePayment: (orderId: string, status: PaymentStatus, amountPaid?: number) => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  onSelectOrder,
  onOpenAddModal,
  onUpdateStatus,
  onUpdatePayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [classFilter, setClassFilter] = useState<string>('All');

  // Extract unique classes
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => {
      if (o.classSection) set.add(o.classSection);
    });
    return Array.from(set).sort();
  }, [orders]);

  // Filtered and searched orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          order.customerName.toLowerCase().includes(q) ||
          order.classSection.toLowerCase().includes(q) ||
          order.productName.toLowerCase().includes(q) ||
          (order.customName || '').toLowerCase().includes(q) ||
          `#${order.slotNumber}`.includes(q) ||
          `slot ${order.slotNumber}`.toLowerCase().includes(q) ||
          `order ${order.orderNumber}`.toLowerCase().includes(q) ||
          `#${order.orderNumber}`.includes(q);
        
        if (!matches) return false;
      }

      // Status filter
      if (statusFilter !== 'All' && order.status !== statusFilter) {
        return false;
      }

      // Payment filter
      if (paymentFilter !== 'All' && order.paymentStatus !== paymentFilter) {
        return false;
      }

      // Class filter
      if (classFilter !== 'All' && order.classSection !== classFilter) {
        return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter, classFilter]);

  const hasActiveFilters = statusFilter !== 'All' || paymentFilter !== 'All' || classFilter !== 'All' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPaymentFilter('All');
    setClassFilter('All');
  };

  return (
    <div className="space-y-5 pb-20 md:pb-10">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>All School Orders</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Search by customer, class, product, custom name, slot # or filter by status
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Enter Paper Order</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>

            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-semibold text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Booked">Booked</option>
              <option value="Queued">Queued</option>
              <option value="Printing">Printing</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Payment dropdown */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-semibold text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid Only</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid Only</option>
            </select>

            {/* Class dropdown */}
            {uniqueClasses.length > 0 && (
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-semibold text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Classes</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            )}

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-slate-500 hover:text-rose-600 font-semibold px-2 py-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders List Cards / Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
          <Search className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">No matching orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {hasActiveFilters ? 'Try adjusting your search query or clearing your filter selection.' : 'Click Enter Paper Order to add your first customer print.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredOrders.map((order) => {
            const costs = calculateOrderCosts(order.filamentGrams, order.printTimeHours, order.sellingPrice);
            const collected = getMoneyCollected(order);
            const owed = getMoneyOwed(order);

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  {/* Left info: Slot + Customer + Class */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <SlotBadge slotNumber={order.slotNumber} />
                    <span className="font-bold text-slate-900 text-base">
                      {order.customerName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Class {order.classSection}
                    </span>
                    <span className="text-xs text-slate-400">
                      (Paper: {order.orderDate} {formatTime12H(order.orderTime)})
                    </span>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2">
                    <PaymentBadge 
                      paymentStatus={order.paymentStatus} 
                      amountPaid={order.amountPaid}
                      totalPrice={order.sellingPrice}
                    />
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                {/* Product & Financial Overview Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                      <span>{order.quantity > 1 ? `${order.quantity}x ` : ''}{order.productName}</span>
                      {order.customName && (
                        <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 text-[11px]">
                          "{order.customName}"
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 flex items-center gap-3 text-[11px]">
                      <span>⚖️ {order.filamentGrams}g</span>
                      <span>🕒 {order.printTimeHours} hrs</span>
                      <span>Give Owner: <strong className="text-amber-800">{formatINR(costs.ownerPayout)}</strong></span>
                      <span>Profit: <strong className="text-emerald-700">+{formatINR(costs.profit)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Price</span>
                      <span className="font-extrabold text-slate-900 font-mono text-sm">{formatINR(order.sellingPrice)}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
