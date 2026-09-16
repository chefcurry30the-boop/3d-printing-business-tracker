import React from 'react';
import { Order, OrderStatus, ViewTab } from '../types';
import { 
  calculateOrderCosts, 
  formatINR, 
  getMoneyCollected, 
  getMoneyOwed, 
  formatTime12H 
} from '../utils/calculations';
import { StatusBadge, SlotBadge, PaymentBadge } from './StatusBadges';
import { 
  Printer, 
  Coins, 
  TrendingUp, 
  Layers, 
  Zap, 
  Clock, 
  CheckCircle2, 
  PackageCheck, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  Plus,
  Play,
  Check,
  Tag,
  ChevronRight,
  Flame,
  Camera
} from 'lucide-react';

interface DashboardProps {
  orders: Order[];
  onOpenAddModal: () => void;
  onOpenDocumentViewer?: () => void;
  hasUploadedDocument?: boolean;
  onSelectOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onViewTab: (tab: ViewTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  orders,
  onOpenAddModal,
  onOpenDocumentViewer,
  hasUploadedDocument,
  onSelectOrder,
  onUpdateStatus,
  onViewTab,
}) => {
  // Exclude cancelled orders from financial calculations & material consumption
  const activeOrders = orders.filter(o => o.status !== 'Cancelled');

  // Order Counts
  const totalOrdersCount = orders.length;
  const queuedOrders = orders.filter(o => o.status === 'Queued');
  const printingOrders = orders.filter(o => o.status === 'Printing');
  const readyOrders = orders.filter(o => o.status === 'Ready');
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');
  const bookedOrders = orders.filter(o => o.status === 'Booked');

  // Financial Calculations across active orders
  let totalSales = 0;
  let totalCollected = 0;
  let totalFilamentCost = 0;
  let totalElectricityCost = 0;
  let totalFilamentGrams = 0;
  let totalElectricityUnits = 0;

  activeOrders.forEach(order => {
    totalSales += order.sellingPrice;
    totalCollected += getMoneyCollected(order);

    const cost = calculateOrderCosts(order.filamentGrams, order.printTimeHours, order.sellingPrice);
    totalFilamentCost += cost.filamentCost;
    totalElectricityCost += cost.electricityCost;
    totalFilamentGrams += order.filamentGrams;
    totalElectricityUnits += cost.electricityUnits;
  });

  const totalOwedByCustomers = Math.max(0, totalSales - totalCollected);
  const totalProductionCost = totalFilamentCost + totalElectricityCost;
  const totalAmountToOwner = totalProductionCost; // Filament + Electricity costs
  const totalProfit = totalSales - totalProductionCost;
  const profitMarginPercent = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : '0.0';

  // Next order to print: Currently Printing OR first in Queued/Booked
  const currentPrintingOrder = printingOrders[0];
  const nextInQueueOrder = queuedOrders[0] || bookedOrders[0];

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Top Banner: Quick Paper Entry Callout */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <Layers className="w-3.5 h-3.5 text-indigo-300" />
              <span>School 3D-Print Workflow</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Paper Order & Profit Tracker
            </h2>
            <p className="text-sm text-indigo-200/90 max-w-xl">
              Write orders on paper at school, enter original times at home. Queue slots and printer owner payouts calculate automatically.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            {onOpenDocumentViewer && (
              <button
                id="dashboard-btn-screenshot-viewer"
                onClick={onOpenDocumentViewer}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-700/80 hover:bg-indigo-600 active:scale-98 text-white font-semibold text-sm border border-indigo-500/40 shadow-sm transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-indigo-300" />
                <span>{hasUploadedDocument ? 'View Slip Screenshot' : 'Upload / Paste Slip'}</span>
              </button>
            )}

            <button
              id="dashboard-btn-quick-add"
              onClick={onOpenAddModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-amber-950 font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Enter Paper Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Printing Spotlight / Next Up */}
      {(currentPrintingOrder || nextInQueueOrder) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {currentPrintingOrder ? 'Currently on 3D Printer' : 'Next Order to Print'}
              </h3>
            </div>
            <button
              onClick={() => onViewTab('queue')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View Full Queue <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {(() => {
            const spotlightOrder = currentPrintingOrder || nextInQueueOrder;
            const spotlightCosts = calculateOrderCosts(
              spotlightOrder.filamentGrams,
              spotlightOrder.printTimeHours,
              spotlightOrder.sellingPrice
            );

            return (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 rounded-xl p-3.5 sm:p-4 border border-slate-200/70">
                <div className="flex items-start gap-3">
                  <SlotBadge slotNumber={spotlightOrder.slotNumber} isTop={true} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-base">
                        {spotlightOrder.customerName}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-700">
                        Class {spotlightOrder.classSection}
                      </span>
                      <StatusBadge status={spotlightOrder.status} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      Product: <span className="font-semibold text-slate-800">{spotlightOrder.productName}</span>
                      {spotlightOrder.customName && (
                        <span className="ml-2 text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                          "{spotlightOrder.customName}"
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>🕒 {spotlightOrder.printTimeHours} hrs</span>
                      <span>⚖️ {spotlightOrder.filamentGrams}g filament</span>
                      <span className="font-bold text-emerald-700">Price: {formatINR(spotlightOrder.sellingPrice)}</span>
                      <span>Paper time: {formatTime12H(spotlightOrder.orderTime)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Advance Status Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {spotlightOrder.status === 'Queued' || spotlightOrder.status === 'Booked' ? (
                    <button
                      id={`btn-start-printing-${spotlightOrder.id}`}
                      onClick={() => onUpdateStatus(spotlightOrder.id, 'Printing')}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Start Printing</span>
                    </button>
                  ) : spotlightOrder.status === 'Printing' ? (
                    <button
                      id={`btn-mark-ready-${spotlightOrder.id}`}
                      onClick={() => onUpdateStatus(spotlightOrder.id, 'Ready')}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Print Ready</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => onSelectOrder(spotlightOrder)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* SECTION 1: Key Financials & Owner Payout (Most Important for Business) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Money & Profit Summary</span>
          </h3>
          <button
            onClick={() => onViewTab('summary')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Financial Breakdown →
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Sales */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales</span>
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Tag className="w-4 h-4" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
              {formatINR(totalSales)}
            </div>
            <p className="text-xs text-slate-500">
              {activeOrders.length} active orders
            </p>
          </div>

          {/* Card 2: Money Collected (🟢 Green) */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-2xs space-y-1 bg-gradient-to-b from-emerald-50/40 to-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Money Collected</span>
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono">
              {formatINR(totalCollected)}
            </div>
            <p className="text-xs text-emerald-600 font-medium">
              Cash received in hand
            </p>
          </div>

          {/* Card 3: Money Still Owed by Customers (🔴 Red) */}
          <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-2xs space-y-1 bg-gradient-to-b from-rose-50/40 to-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Owed by Customers</span>
              <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-600 font-mono">
              {formatINR(totalOwedByCustomers)}
            </div>
            <p className="text-xs text-rose-500 font-medium">
              Unpaid / pending balance
            </p>
          </div>

          {/* Card 4: Profit / Money Left Over (🟢 Green Highlight) */}
          <div className="bg-white rounded-2xl p-4 border-2 border-emerald-500 shadow-xs space-y-1 bg-gradient-to-b from-emerald-500/10 to-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Net Profit Left</span>
              <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono">
              {formatINR(totalProfit)}
            </div>
            <p className="text-xs text-emerald-800 font-semibold">
              {profitMarginPercent}% profit margin
            </p>
          </div>
        </div>

        {/* Sub-financial Row: Production Costs & Amount to Give Printer Owner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          {/* Filament Cost */}
          <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 font-medium">Filament Cost (₹1.00/g)</span>
              <div className="text-base font-bold text-slate-800 font-mono">
                {formatINR(totalFilamentCost)}
              </div>
            </div>
            <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 font-medium">
              {totalFilamentGrams}g used
            </span>
          </div>

          {/* Electricity Cost */}
          <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 font-medium">Electricity Cost (₹9/unit)</span>
              <div className="text-base font-bold text-slate-800 font-mono">
                {formatINR(totalElectricityCost)}
              </div>
            </div>
            <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 font-medium">
              {totalElectricityUnits.toFixed(2)} units
            </span>
          </div>

          {/* Total Amount to Give Printer Owner */}
          <div className="bg-amber-50/80 rounded-xl p-3.5 border border-amber-300 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-900">Pay to Printer Owner</span>
              <div className="text-base font-bold text-amber-950 font-mono">
                {formatINR(totalAmountToOwner)}
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-2 py-1 rounded border border-amber-300">
              Filament + Power
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Orders Status Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Order Status Pipeline</span>
          </h3>
          <button
            onClick={() => onViewTab('orders')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            All Orders ({totalOrdersCount}) →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Total Orders */}
          <div 
            onClick={() => onViewTab('orders')} 
            className="bg-white rounded-xl p-3 border border-slate-200 text-center cursor-pointer hover:border-slate-400 transition-colors"
          >
            <span className="text-xs font-semibold text-slate-500 block">Total Orders</span>
            <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
              {totalOrdersCount}
            </span>
          </div>

          {/* Queued (🟡 Yellow) */}
          <div 
            onClick={() => onViewTab('queue')} 
            className="bg-amber-50/70 rounded-xl p-3 border border-amber-200 text-center cursor-pointer hover:border-amber-400 transition-colors"
          >
            <span className="text-xs font-bold text-amber-800 block">🟡 In Queue</span>
            <span className="text-2xl font-bold text-amber-900 font-mono mt-1 block">
              {queuedOrders.length + bookedOrders.length}
            </span>
          </div>

          {/* Printing (🔵 Blue) */}
          <div 
            onClick={() => onViewTab('queue')} 
            className="bg-blue-50/70 rounded-xl p-3 border border-blue-200 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            <span className="text-xs font-bold text-blue-800 block">🔵 Printing</span>
            <span className="text-2xl font-bold text-blue-900 font-mono mt-1 block">
              {printingOrders.length}
            </span>
          </div>

          {/* Ready (🟢 Green) */}
          <div 
            onClick={() => onViewTab('orders')} 
            className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200 text-center cursor-pointer hover:border-emerald-400 transition-colors"
          >
            <span className="text-xs font-bold text-emerald-800 block">🟢 Ready</span>
            <span className="text-2xl font-bold text-emerald-900 font-mono mt-1 block">
              {readyOrders.length}
            </span>
          </div>

          {/* Delivered (🟢 Green) */}
          <div 
            onClick={() => onViewTab('orders')} 
            className="bg-teal-50/70 rounded-xl p-3 border border-teal-200 text-center cursor-pointer hover:border-teal-400 transition-colors"
          >
            <span className="text-xs font-bold text-teal-800 block">📦 Delivered</span>
            <span className="text-2xl font-bold text-teal-900 font-mono mt-1 block">
              {deliveredOrders.length}
            </span>
          </div>

          {/* Cancelled */}
          <div 
            onClick={() => onViewTab('orders')} 
            className="bg-slate-100 rounded-xl p-3 border border-slate-200 text-center cursor-pointer hover:border-slate-300 transition-colors"
          >
            <span className="text-xs font-semibold text-slate-500 block">Cancelled</span>
            <span className="text-2xl font-bold text-slate-500 font-mono mt-1 block">
              {cancelledOrders.length}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Materials & Filament Inventory Meter */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Materials & Utility Consumption</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filament Consumption */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Filament Spool Usage</span>
              <span className="font-mono font-bold text-indigo-700">
                {totalFilamentGrams}g / 1000g ({(totalFilamentGrams / 10).toFixed(1)}% of 1kg roll)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalFilamentGrams / 1000) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Standard 1kg roll: ₹1,000 (₹1.00/g)</span>
              <span>Total Filament Cost: <strong className="text-slate-800">{formatINR(totalFilamentCost)}</strong></span>
            </div>
          </div>

          {/* Electricity Consumption */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Electricity Units Consumed</span>
              <span className="font-mono font-bold text-amber-700">
                {totalElectricityUnits.toFixed(2)} Units @ ₹9/unit
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalElectricityUnits / 50) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Rate: ₹9.00/unit (1 kWh) · ₹45 for 24h</span>
              <span>Total Power Cost: <strong className="text-slate-800">{formatINR(totalElectricityCost)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Recent Orders Quick Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900">Recent School Orders</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewTab('table')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300"
            >
              Spreadsheet Grid →
            </button>
            <button
              onClick={() => onViewTab('orders')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cards ({orders.length}) →
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <p className="text-sm font-semibold text-slate-700">No orders recorded yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tap "Enter Paper Order" to log student orders brought from school.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enter First Paper Order</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.slice(0, 4).map((order) => {
              const costs = calculateOrderCosts(order.filamentGrams, order.printTimeHours, order.sellingPrice);
              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/70 hover:border-indigo-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <SlotBadge slotNumber={order.slotNumber} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {order.customerName}
                        </span>
                        <span className="text-xs text-slate-600 font-medium bg-slate-200 px-1.5 py-0.2 rounded">
                          Class {order.classSection}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {order.productName}
                        {order.customName && ` • "${order.customName}"`}
                        <span className="ml-1 text-slate-400">({order.orderDate} {formatTime12H(order.orderTime)})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="font-bold text-slate-900 text-sm font-mono">
                        {formatINR(order.sellingPrice)}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-600">
                        +{formatINR(costs.profit)} profit
                      </div>
                    </div>
                    <StatusBadge status={order.status} className="hidden sm:inline-flex" />
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
