import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { 
  calculateOrderCosts, 
  formatINR, 
  getMoneyCollected, 
  getMoneyOwed, 
  formatTime12H 
} from '../utils/calculations';
import { StatusBadge, PaymentBadge, SlotBadge } from './StatusBadges';
import { 
  Table as TableIcon, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Plus, 
  FileSpreadsheet, 
  Eye, 
  Edit3, 
  Printer, 
  Trash2, 
  SlidersHorizontal, 
  Maximize2, 
  Minimize2,
  FileImage,
  Sparkles,
  CheckCircle,
  Clock,
  Coins
} from 'lucide-react';

interface TableViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onOpenAddModal: () => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdatePayment: (orderId: string, paymentStatus: PaymentStatus, amountPaid?: number) => void;
  onPrintSlip: (order: Order) => void;
  onOpenDocumentViewer?: () => void;
  hasUploadedDocument?: boolean;
}

type SortField = 
  | 'slotNumber'
  | 'orderNumber'
  | 'orderDate'
  | 'customerName'
  | 'classSection'
  | 'productName'
  | 'quantity'
  | 'printTimeHours'
  | 'filamentGrams'
  | 'sellingPrice'
  | 'filamentCost'
  | 'electricityCost'
  | 'ownerPayout'
  | 'profit'
  | 'paymentStatus'
  | 'status';

type ColumnPreset = 'all' | 'essential' | 'financial' | 'manufacturing';

export const TableView: React.FC<TableViewProps> = ({
  orders,
  onSelectOrder,
  onOpenAddModal,
  onEditOrder,
  onDeleteOrder,
  onUpdateStatus,
  onUpdatePayment,
  onPrintSlip,
  onOpenDocumentViewer,
  hasUploadedDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('slotNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [columnPreset, setColumnPreset] = useState<ColumnPreset>('all');
  const [isCompact, setIsCompact] = useState(false);

  // Available classes for filter
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => {
      if (o.classSection) set.add(o.classSection);
    });
    return Array.from(set).sort();
  }, [orders]);

  // Handle Sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted orders
  const processedOrders = useMemo(() => {
    return orders
      .filter(order => {
        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) return false;
        // Payment filter
        if (paymentFilter !== 'all' && order.paymentStatus !== paymentFilter) return false;
        // Class filter
        if (classFilter !== 'all' && order.classSection !== classFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = order.customerName.toLowerCase().includes(q);
          const matchClass = (order.classSection || '').toLowerCase().includes(q);
          const matchProduct = order.productName.toLowerCase().includes(q);
          const matchCustom = (order.customName || '').toLowerCase().includes(q);
          const matchNotes = (order.notes || '').toLowerCase().includes(q);
          const matchSlot = `slot ${order.slotNumber}`.includes(q) || `#${order.slotNumber}`.includes(q) || `${order.slotNumber}` === q;
          const matchOrderNum = `${order.orderNumber}`.includes(q);
          if (!matchName && !matchClass && !matchProduct && !matchCustom && !matchNotes && !matchSlot && !matchOrderNum) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        let valueA: any;
        let valueB: any;

        const costsA = calculateOrderCosts(a.filamentGrams, a.printTimeHours, a.sellingPrice);
        const costsB = calculateOrderCosts(b.filamentGrams, b.printTimeHours, b.sellingPrice);

        switch (sortField) {
          case 'slotNumber':
            valueA = a.slotNumber;
            valueB = b.slotNumber;
            break;
          case 'orderNumber':
            valueA = a.orderNumber;
            valueB = b.orderNumber;
            break;
          case 'orderDate':
            valueA = `${a.orderDate} ${a.orderTime}`;
            valueB = `${b.orderDate} ${b.orderTime}`;
            break;
          case 'customerName':
            valueA = a.customerName.toLowerCase();
            valueB = b.customerName.toLowerCase();
            break;
          case 'classSection':
            valueA = a.classSection.toLowerCase();
            valueB = b.classSection.toLowerCase();
            break;
          case 'productName':
            valueA = a.productName.toLowerCase();
            valueB = b.productName.toLowerCase();
            break;
          case 'quantity':
            valueA = a.quantity;
            valueB = b.quantity;
            break;
          case 'printTimeHours':
            valueA = a.printTimeHours;
            valueB = b.printTimeHours;
            break;
          case 'filamentGrams':
            valueA = a.filamentGrams;
            valueB = b.filamentGrams;
            break;
          case 'sellingPrice':
            valueA = a.sellingPrice;
            valueB = b.sellingPrice;
            break;
          case 'filamentCost':
            valueA = costsA.filamentCost;
            valueB = costsB.filamentCost;
            break;
          case 'electricityCost':
            valueA = costsA.electricityCost;
            valueB = costsB.electricityCost;
            break;
          case 'ownerPayout':
            valueA = costsA.ownerPayout;
            valueB = costsB.ownerPayout;
            break;
          case 'profit':
            valueA = costsA.profit;
            valueB = costsB.profit;
            break;
          case 'paymentStatus':
            valueA = a.paymentStatus;
            valueB = b.paymentStatus;
            break;
          case 'status':
            valueA = a.status;
            valueB = b.status;
            break;
          default:
            valueA = a.slotNumber;
            valueB = b.slotNumber;
        }

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [orders, statusFilter, paymentFilter, classFilter, searchQuery, sortField, sortDirection]);

  // Aggregate Totals for Table Footer
  const tableTotals = useMemo(() => {
    let totalQty = 0;
    let totalHours = 0;
    let totalGrams = 0;
    let totalRevenue = 0;
    let totalFilamentCost = 0;
    let totalElectricityCost = 0;
    let totalOwnerPayout = 0;
    let totalProfit = 0;
    let totalCollected = 0;

    processedOrders.forEach(order => {
      if (order.status !== 'Cancelled') {
        totalQty += order.quantity;
        totalHours += order.printTimeHours;
        totalGrams += order.filamentGrams;
        totalRevenue += order.sellingPrice;
        totalCollected += getMoneyCollected(order);

        const c = calculateOrderCosts(order.filamentGrams, order.printTimeHours, order.sellingPrice);
        totalFilamentCost += c.filamentCost;
        totalElectricityCost += c.electricityCost;
        totalOwnerPayout += c.ownerPayout;
        totalProfit += c.profit;
      }
    });

    return {
      count: processedOrders.length,
      totalQty,
      totalHours,
      totalGrams,
      totalRevenue,
      totalFilamentCost,
      totalElectricityCost,
      totalOwnerPayout,
      totalProfit,
      totalCollected,
      totalOwed: Math.max(0, totalRevenue - totalCollected),
    };
  }, [processedOrders]);

  // Export visible rows to CSV
  const handleExportCSV = () => {
    const headers = [
      'Slot #',
      'Order #',
      'Customer Name',
      'Class/Section',
      'Paper Order Date',
      'Paper Order Time',
      'Product Name',
      'Custom Inscription',
      'Quantity',
      'Print Hours',
      'Filament Grams',
      'Selling Price (INR)',
      'Filament Cost (INR)',
      'Electricity Cost (INR)',
      'Owner Payout (INR)',
      'Net Profit (INR)',
      'Payment Status',
      'Amount Paid (INR)',
      'Balance Due (INR)',
      'Status',
      'Notes',
    ];

    const rows = processedOrders.map(o => {
      const c = calculateOrderCosts(o.filamentGrams, o.printTimeHours, o.sellingPrice);
      const owed = getMoneyOwed(o);
      return [
        o.slotNumber,
        o.orderNumber,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.classSection.replace(/"/g, '""')}"`,
        o.orderDate,
        o.orderTime,
        `"${o.productName.replace(/"/g, '""')}"`,
        `"${(o.customName || '').replace(/"/g, '""')}"`,
        o.quantity,
        o.printTimeHours,
        o.filamentGrams,
        o.sellingPrice,
        c.filamentCost,
        c.electricityCost,
        c.ownerPayout,
        c.profit,
        o.paymentStatus,
        o.amountPaid,
        owed,
        o.status,
        `"${(o.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `3D_Print_Grid_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 font-bold" />
    );
  };

  return (
    <div className="space-y-4 pb-20 md:pb-10">
      {/* Top Header & Quick Control Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <TableIcon className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Order Spreadsheet & Ledger Grid</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                    {processedOrders.length} {processedOrders.length === 1 ? 'row' : 'rows'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Full column & row breakdown of all school orders, exact manufacturing costs, owner payouts, and live queue slots
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenDocumentViewer && (
              <button
                onClick={onOpenDocumentViewer}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="View uploaded PDF or screenshot of school orders"
              >
                <FileImage className="w-3.5 h-3.5 text-purple-600" />
                <span>{hasUploadedDocument ? 'View Order Screenshot/PDF' : 'Upload Order Screenshot/PDF'}</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsCompact(!isCompact)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isCompact 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="Toggle Compact row density"
            >
              {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              <span>{isCompact ? 'Comfortable Rows' : 'Compact Rows'}</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Order</span>
            </button>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, class, item, slot #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-700"
            >
              <option value="all">All Production Statuses</option>
              <option value="Booked">Booked</option>
              <option value="Queued">Queued</option>
              <option value="Printing">Printing</option>
              <option value="Ready">Ready for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-700"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid">Paid Only</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid / Cash Due</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-700"
            >
              <option value="all">All Classes & Sections</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Column View Preset Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3 h-3" /> Column Focus:
          </span>
          <button
            onClick={() => setColumnPreset('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              columnPreset === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Columns ({processedOrders.length > 0 ? '16' : '0'})
          </button>
          <button
            onClick={() => setColumnPreset('essential')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              columnPreset === 'essential'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Essential View
          </button>
          <button
            onClick={() => setColumnPreset('financial')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              columnPreset === 'financial'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Financial & Payout Ledger
          </button>
          <button
            onClick={() => setColumnPreset('manufacturing')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              columnPreset === 'manufacturing'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Manufacturing & Materials
          </button>
        </div>
      </div>

      {/* Main Spreadsheet Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left border-collapse text-xs">
            {/* Table Header */}
            <thead className="bg-slate-50 border-b border-slate-200 select-none text-slate-600 font-bold sticky top-0 z-10">
              <tr>
                {/* Slot # Column */}
                <th 
                  onClick={() => handleSort('slotNumber')}
                  className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition-colors w-16"
                >
                  <div className="flex items-center gap-1">
                    <span>Slot</span>
                    {renderSortIcon('slotNumber')}
                  </div>
                </th>

                {/* Order # Column */}
                <th 
                  onClick={() => handleSort('orderNumber')}
                  className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition-colors w-16 text-slate-500"
                >
                  <div className="flex items-center gap-1">
                    <span>Order#</span>
                    {renderSortIcon('orderNumber')}
                  </div>
                </th>

                {/* Paper Order Date & Time */}
                {(columnPreset === 'all' || columnPreset === 'essential') && (
                  <th 
                    onClick={() => handleSort('orderDate')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition-colors min-w-[130px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Paper Date & Time</span>
                      {renderSortIcon('orderDate')}
                    </div>
                  </th>
                )}

                {/* Customer Name */}
                <th 
                  onClick={() => handleSort('customerName')}
                  className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition-colors min-w-[140px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Customer</span>
                    {renderSortIcon('customerName')}
                  </div>
                </th>

                {/* Class / Section */}
                <th 
                  onClick={() => handleSort('classSection')}
                  className="py-3 px-2 cursor-pointer group hover:bg-slate-100 transition-colors w-20"
                >
                  <div className="flex items-center gap-1">
                    <span>Class</span>
                    {renderSortIcon('classSection')}
                  </div>
                </th>

                {/* Item / Product */}
                <th 
                  onClick={() => handleSort('productName')}
                  className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition-colors min-w-[150px]"
                >
                  <div className="flex items-center gap-1">
                    <span>3D Print Item</span>
                    {renderSortIcon('productName')}
                  </div>
                </th>

                {/* Custom Name / Inscription */}
                {(columnPreset === 'all' || columnPreset === 'manufacturing') && (
                  <th className="py-3 px-3 min-w-[120px] text-slate-500">
                    Custom Inscription
                  </th>
                )}

                {/* Quantity */}
                {(columnPreset === 'all' || columnPreset === 'manufacturing') && (
                  <th 
                    onClick={() => handleSort('quantity')}
                    className="py-3 px-2 cursor-pointer group hover:bg-slate-100 transition-colors text-center w-14"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Qty</span>
                      {renderSortIcon('quantity')}
                    </div>
                  </th>
                )}

                {/* Print Time (hrs) */}
                {(columnPreset === 'all' || columnPreset === 'manufacturing') && (
                  <th 
                    onClick={() => handleSort('printTimeHours')}
                    className="py-3 px-2 cursor-pointer group hover:bg-slate-100 transition-colors text-right w-20"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Time (h)</span>
                      {renderSortIcon('printTimeHours')}
                    </div>
                  </th>
                )}

                {/* Filament (g) */}
                {(columnPreset === 'all' || columnPreset === 'manufacturing') && (
                  <th 
                    onClick={() => handleSort('filamentGrams')}
                    className="py-3 px-2 cursor-pointer group hover:bg-slate-100 transition-colors text-right w-20"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Filament</span>
                      {renderSortIcon('filamentGrams')}
                    </div>
                  </th>
                )}

                {/* Selling Price */}
                {(columnPreset === 'all' || columnPreset === 'essential' || columnPreset === 'financial') && (
                  <th 
                    onClick={() => handleSort('sellingPrice')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition-colors text-right min-w-[100px]"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Price (₹)</span>
                      {renderSortIcon('sellingPrice')}
                    </div>
                  </th>
                )}

                {/* Filament Cost */}
                {(columnPreset === 'all' || columnPreset === 'financial') && (
                  <th 
                    onClick={() => handleSort('filamentCost')}
                    className="py-3 px-2 cursor-pointer group hover:bg-slate-100 transition-colors text-right w-24 text-slate-500"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Filament Cost</span>
                      {renderSortIcon('filamentCost')}
                    </div>
                  </th>
                )}

                {/* Electricity Cost */}
                {(columnPreset === 'all' || columnPreset === 'financial') && (
                  <th 
                    onClick={() => handleSort('electricityCost')}
                    className="py-3 px-2 cursor-pointer group hover:bg-slate-100 transition-colors text-right w-24 text-slate-500"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Power Cost</span>
                      {renderSortIcon('electricityCost')}
                    </div>
                  </th>
                )}

                {/* Owner Payout */}
                {(columnPreset === 'all' || columnPreset === 'financial') && (
                  <th 
                    onClick={() => handleSort('ownerPayout')}
                    className="py-3 px-3 cursor-pointer group hover:bg-amber-50/70 transition-colors text-right min-w-[105px] text-amber-900 bg-amber-50/40"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Owner Payout</span>
                      {renderSortIcon('ownerPayout')}
                    </div>
                  </th>
                )}

                {/* Net Profit */}
                {(columnPreset === 'all' || columnPreset === 'essential' || columnPreset === 'financial') && (
                  <th 
                    onClick={() => handleSort('profit')}
                    className="py-3 px-3 cursor-pointer group hover:bg-emerald-50/70 transition-colors text-right min-w-[100px] text-emerald-900 bg-emerald-50/40"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Profit (₹)</span>
                      {renderSortIcon('profit')}
                    </div>
                  </th>
                )}

                {/* Payment Status */}
                {(columnPreset === 'all' || columnPreset === 'essential' || columnPreset === 'financial') && (
                  <th 
                    onClick={() => handleSort('paymentStatus')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition-colors min-w-[125px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Payment</span>
                      {renderSortIcon('paymentStatus')}
                    </div>
                  </th>
                )}

                {/* Production Status */}
                <th 
                  onClick={() => handleSort('status')}
                  className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition-colors min-w-[130px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    {renderSortIcon('status')}
                  </div>
                </th>

                {/* Actions */}
                <th className="py-3 px-3 text-right w-24 text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 font-sans">
              {processedOrders.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-14 text-center text-slate-500">
                    <div className="space-y-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <TableIcon className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-800 text-sm">No Orders Found in Ledger</div>
                      <p className="text-xs text-slate-500">
                        {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' || classFilter !== 'all'
                          ? 'Try clearing your search or filter tags.'
                          : 'Get started by entering orders from your school slips or uploading a screenshot.'}
                      </p>
                      <button
                        onClick={onOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Enter First Order</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                processedOrders.map((order) => {
                  const costs = calculateOrderCosts(order.filamentGrams, order.printTimeHours, order.sellingPrice);
                  const owed = getMoneyOwed(order);
                  const isDelivered = order.status === 'Delivered';
                  const isCancelled = order.status === 'Cancelled';
                  const isPrinting = order.status === 'Printing';

                  return (
                    <tr 
                      key={order.id}
                      className={`hover:bg-indigo-50/40 transition-colors group ${
                        isCancelled ? 'opacity-50 bg-slate-50/60' : ''
                      } ${isPrinting ? 'bg-blue-50/30' : ''}`}
                    >
                      {/* Slot # */}
                      <td className={`px-3 font-mono font-bold ${isCompact ? 'py-2' : 'py-3'}`}>
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 text-white text-xs">
                          #{order.slotNumber}
                        </span>
                      </td>

                      {/* Order # */}
                      <td className={`px-3 font-mono text-slate-500 font-semibold ${isCompact ? 'py-2' : 'py-3'}`}>
                        #{order.orderNumber}
                      </td>

                      {/* Paper Date & Time */}
                      {(columnPreset === 'all' || columnPreset === 'essential') && (
                        <td className={`px-3 whitespace-nowrap ${isCompact ? 'py-2' : 'py-3'}`}>
                          <div className="font-semibold text-slate-800">{order.orderDate}</div>
                          <div className="text-[11px] text-amber-700 font-medium">{formatTime12H(order.orderTime)}</div>
                        </td>
                      )}

                      {/* Customer Name */}
                      <td className={`px-3 font-bold text-slate-900 ${isCompact ? 'py-2' : 'py-3'}`}>
                        <button 
                          onClick={() => onSelectOrder(order)}
                          className="hover:text-indigo-600 text-left font-bold cursor-pointer hover:underline"
                        >
                          {order.customerName}
                        </button>
                      </td>

                      {/* Class */}
                      <td className={`px-2 ${isCompact ? 'py-2' : 'py-3'}`}>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] font-mono">
                          {order.classSection ? `Class ${order.classSection}` : '—'}
                        </span>
                      </td>

                      {/* Product Name */}
                      <td className={`px-3 font-medium text-slate-800 ${isCompact ? 'py-2' : 'py-3'}`}>
                        <div className="font-semibold text-slate-900">{order.productName}</div>
                        {order.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[160px]" title={order.notes}>
                            {order.notes}
                          </div>
                        )}
                      </td>

                      {/* Custom Inscription */}
                      {(columnPreset === 'all' || columnPreset === 'manufacturing') && (
                        <td className={`px-3 font-mono ${isCompact ? 'py-2' : 'py-3'}`}>
                          {order.customName ? (
                            <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-900 font-bold text-[11px]">
                              "{order.customName}"
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      )}

                      {/* Quantity */}
                      {(columnPreset === 'all' || columnPreset === 'manufacturing') && (
                        <td className={`px-2 text-center font-bold font-mono text-slate-800 ${isCompact ? 'py-2' : 'py-3'}`}>
                          {order.quantity}x
                        </td>
                      )}

                      {/* Print Hours */}
                      {(columnPreset === 'all' || columnPreset === 'manufacturing') && (
                        <td className={`px-2 text-right font-mono text-slate-700 ${isCompact ? 'py-2' : 'py-3'}`}>
                          {order.printTimeHours} hrs
                        </td>
                      )}

                      {/* Filament Grams */}
                      {(columnPreset === 'all' || columnPreset === 'manufacturing') && (
                        <td className={`px-2 text-right font-mono font-semibold text-slate-800 ${isCompact ? 'py-2' : 'py-3'}`}>
                          {order.filamentGrams}g
                        </td>
                      )}

                      {/* Selling Price */}
                      {(columnPreset === 'all' || columnPreset === 'essential' || columnPreset === 'financial') && (
                        <td className={`px-3 text-right font-mono font-extrabold text-slate-900 ${isCompact ? 'py-2' : 'py-3'}`}>
                          {formatINR(order.sellingPrice)}
                        </td>
                      )}

                      {/* Filament Cost */}
                      {(columnPreset === 'all' || columnPreset === 'financial') && (
                        <td className={`px-2 text-right font-mono text-slate-600 ${isCompact ? 'py-2' : 'py-3'}`}>
                          {formatINR(costs.filamentCost)}
                        </td>
                      )}

                      {/* Electricity Cost */}
                      {(columnPreset === 'all' || columnPreset === 'financial') && (
                        <td className={`px-2 text-right font-mono text-slate-600 ${isCompact ? 'py-2' : 'py-3'}`}>
                          {formatINR(costs.electricityCost)}
                        </td>
                      )}

                      {/* Owner Payout */}
                      {(columnPreset === 'all' || columnPreset === 'financial') && (
                        <td className={`px-3 text-right font-mono font-bold text-amber-900 bg-amber-50/30 ${isCompact ? 'py-2' : 'py-3'}`}>
                          {formatINR(costs.ownerPayout)}
                        </td>
                      )}

                      {/* Net Profit */}
                      {(columnPreset === 'all' || columnPreset === 'essential' || columnPreset === 'financial') && (
                        <td className={`px-3 text-right font-mono font-extrabold text-emerald-700 bg-emerald-50/30 ${isCompact ? 'py-2' : 'py-3'}`}>
                          +{formatINR(costs.profit)}
                        </td>
                      )}

                      {/* Payment Status Dropdown / Indicator */}
                      {(columnPreset === 'all' || columnPreset === 'essential' || columnPreset === 'financial') && (
                        <td className={`px-3 ${isCompact ? 'py-2' : 'py-3'}`}>
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => {
                              const newStatus = e.target.value as PaymentStatus;
                              const amt = newStatus === 'Paid' 
                                ? order.sellingPrice 
                                : newStatus === 'Unpaid' 
                                  ? 0 
                                  : (order.amountPaid || Math.round(order.sellingPrice / 2));
                              onUpdatePayment(order.id, newStatus, amt);
                            }}
                            className={`px-2 py-1 rounded-lg text-xs font-bold font-mono border focus:outline-none cursor-pointer ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : order.paymentStatus === 'Partially Paid'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            <option value="Paid">Paid ({formatINR(order.sellingPrice)})</option>
                            <option value="Partially Paid">Partial (₹{order.amountPaid})</option>
                            <option value="Unpaid">Unpaid (Owes {formatINR(order.sellingPrice)})</option>
                          </select>
                        </td>
                      )}

                      {/* Production Status Dropdown */}
                      <td className={`px-3 ${isCompact ? 'py-2' : 'py-3'}`}>
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                            order.status === 'Ready'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.status === 'Printing'
                                ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse'
                                : order.status === 'Delivered'
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : order.status === 'Queued'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : order.status === 'Cancelled'
                                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                                      : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}
                        >
                          <option value="Booked">Booked</option>
                          <option value="Queued">Queued</option>
                          <option value="Printing">Printing</option>
                          <option value="Ready">Ready</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className={`px-3 text-right whitespace-nowrap ${isCompact ? 'py-2' : 'py-3'}`}>
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Inspect Order & Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onPrintSlip(order)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Print School Delivery Tag"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditOrder(order)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Order"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer with Pinned Summary Totals */}
            {processedOrders.length > 0 && (
              <tfoot className="bg-slate-900 text-white font-bold text-xs sticky bottom-0 z-10 border-t-2 border-slate-800">
                <tr>
                  <td className="py-3 px-3">
                    TOTALS
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {tableTotals.count} orders
                  </td>

                  {(columnPreset === 'all' || columnPreset === 'essential') && (
                    <td className="py-3 px-3 text-slate-400">
                      —
                    </td>
                  )}

                  <td className="py-3 px-3 text-slate-300">
                    Active Ledger
                  </td>

                  <td className="py-3 px-2 text-slate-400">
                    —
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    {tableTotals.totalQty} total items
                  </td>

                  {(columnPreset === 'all' || columnPreset === 'manufacturing') && (
                    <td className="py-3 px-3 text-slate-400">—</td>
                  )}

                  {(columnPreset === 'all' || columnPreset === 'manufacturing') && (
                    <td className="py-3 px-2 text-center font-mono text-indigo-300">
                      {tableTotals.totalQty}x
                    </td>
                  )}

                  {(columnPreset === 'all' || columnPreset === 'manufacturing') && (
                    <td className="py-3 px-2 text-right font-mono text-slate-300">
                      {tableTotals.totalHours.toFixed(1)}h
                    </td>
                  )}

                  {(columnPreset === 'all' || columnPreset === 'manufacturing') && (
                    <td className="py-3 px-2 text-right font-mono text-indigo-300">
                      {tableTotals.totalGrams}g
                    </td>
                  )}

                  {(columnPreset === 'all' || columnPreset === 'essential' || columnPreset === 'financial') && (
                    <td className="py-3 px-3 text-right font-mono text-white text-sm font-black">
                      {formatINR(tableTotals.totalRevenue)}
                    </td>
                  )}

                  {(columnPreset === 'all' || columnPreset === 'financial') && (
                    <td className="py-3 px-2 text-right font-mono text-slate-300">
                      {formatINR(tableTotals.totalFilamentCost)}
                    </td>
                  )}

                  {(columnPreset === 'all' || columnPreset === 'financial') && (
                    <td className="py-3 px-2 text-right font-mono text-slate-300">
                      {formatINR(tableTotals.totalElectricityCost)}
                    </td>
                  )}

                  {(columnPreset === 'all' || columnPreset === 'financial') && (
                    <td className="py-3 px-3 text-right font-mono text-amber-300 bg-slate-800">
                      {formatINR(tableTotals.totalOwnerPayout)}
                    </td>
                  )}

                  {(columnPreset === 'all' || columnPreset === 'essential' || columnPreset === 'financial') && (
                    <td className="py-3 px-3 text-right font-mono text-emerald-300 bg-slate-800 text-sm font-black">
                      +{formatINR(tableTotals.totalProfit)}
                    </td>
                  )}

                  {(columnPreset === 'all' || columnPreset === 'essential' || columnPreset === 'financial') && (
                    <td className="py-3 px-3 text-slate-300 text-[11px]">
                      <span className="text-emerald-300">Collected: {formatINR(tableTotals.totalCollected)}</span>
                      {tableTotals.totalOwed > 0 && (
                        <span className="block text-rose-300">Owed: {formatINR(tableTotals.totalOwed)}</span>
                      )}
                    </td>
                  )}

                  <td className="py-3 px-3 text-slate-400">
                    —
                  </td>

                  <td className="py-3 px-3 text-right text-slate-400">
                    —
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
