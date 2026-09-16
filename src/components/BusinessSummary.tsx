import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import { 
  calculateOrderCosts, 
  formatINR, 
  getMoneyCollected, 
  getMoneyOwed, 
  formatTime12H 
} from '../utils/calculations';
import { exportOrdersBackupJSON } from '../utils/storage';
import { 
  TrendingUp, 
  Coins, 
  Zap, 
  Printer, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  PieChart, 
  BarChart2, 
  FileText,
  PrinterIcon,
  Sparkles
} from 'lucide-react';

interface BusinessSummaryProps {
  orders: Order[];
  onRestoreBackup: (orders: Order[]) => void;
}

export const BusinessSummary: React.FC<BusinessSummaryProps> = ({
  orders,
  onRestoreBackup,
}) => {
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Active (non-cancelled) orders
  const activeOrders = useMemo(() => orders.filter(o => o.status !== 'Cancelled'), [orders]);

  // Aggregate totals
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalMoneyCollected = 0;
    let totalFilamentCost = 0;
    let totalElectricityCost = 0;
    let totalFilamentGrams = 0;
    let totalElectricityUnits = 0;

    activeOrders.forEach(order => {
      totalRevenue += order.sellingPrice;
      totalMoneyCollected += getMoneyCollected(order);

      const costs = calculateOrderCosts(order.filamentGrams, order.printTimeHours, order.sellingPrice);
      totalFilamentCost += costs.filamentCost;
      totalElectricityCost += costs.electricityCost;
      totalFilamentGrams += order.filamentGrams;
      totalElectricityUnits += costs.electricityUnits;
    });

    const totalProductionCosts = totalFilamentCost + totalElectricityCost;
    const totalAmountToOwner = totalProductionCosts; // Filament + Electricity
    const totalProfit = totalRevenue - totalProductionCosts;
    const totalOwedByCustomers = Math.max(0, totalRevenue - totalMoneyCollected);
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0';

    return {
      totalOrders: orders.length,
      activeOrdersCount: activeOrders.length,
      totalRevenue,
      totalMoneyCollected,
      totalOwedByCustomers,
      totalFilamentCost,
      totalElectricityCost,
      totalProductionCosts,
      totalAmountToOwner,
      totalProfit,
      totalFilamentGrams,
      totalElectricityUnits,
      profitMargin,
    };
  }, [orders, activeOrders]);

  // Class breakdown
  const classBreakdown = useMemo(() => {
    const map: { [cls: string]: { count: number; revenue: number; profit: number } } = {};
    activeOrders.forEach(order => {
      const cls = order.classSection || 'Unassigned';
      if (!map[cls]) {
        map[cls] = { count: 0, revenue: 0, profit: 0 };
      }
      map[cls].count += 1;
      map[cls].revenue += order.sellingPrice;
      const c = calculateOrderCosts(order.filamentGrams, order.printTimeHours, order.sellingPrice);
      map[cls].profit += c.profit;
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [activeOrders]);

  // Product popularity breakdown
  const productBreakdown = useMemo(() => {
    const map: { [prod: string]: { count: number; revenue: number; grams: number } } = {};
    activeOrders.forEach(order => {
      const p = order.productName || 'Custom Print';
      if (!map[p]) {
        map[p] = { count: 0, revenue: 0, grams: 0 };
      }
      map[p].count += order.quantity;
      map[p].revenue += order.sellingPrice;
      map[p].grams += order.filamentGrams;
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [activeOrders]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Slot #',
      'Order #',
      'Customer Name',
      'Class/Section',
      'Order Date (Paper)',
      'Order Time (Paper)',
      'Product Name',
      'Custom Name',
      'Quantity',
      'Print Hours',
      'Filament Grams',
      'Selling Price (INR)',
      'Filament Cost (INR)',
      'Electricity Units',
      'Electricity Cost (INR)',
      'Total Prod Cost (INR)',
      'Owner Payout (INR)',
      'Profit (INR)',
      'Payment Status',
      'Amount Paid (INR)',
      'Status',
      'Notes',
    ];

    const rows = orders.map(order => {
      const c = calculateOrderCosts(order.filamentGrams, order.printTimeHours, order.sellingPrice);
      return [
        order.slotNumber,
        order.orderNumber,
        `"${order.customerName.replace(/"/g, '""')}"`,
        `"${order.classSection.replace(/"/g, '""')}"`,
        order.orderDate,
        order.orderTime,
        `"${order.productName.replace(/"/g, '""')}"`,
        `"${(order.customName || '').replace(/"/g, '""')}"`,
        order.quantity,
        order.printTimeHours,
        order.filamentGrams,
        order.sellingPrice,
        c.filamentCost,
        c.electricityUnits,
        c.electricityCost,
        c.totalProductionCost,
        c.ownerPayout,
        c.profit,
        order.paymentStatus,
        order.amountPaid,
        order.status,
        `"${(order.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `3D_Print_School_Business_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const jsonStr = exportOrdersBackupJSON(orders);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `3D_Print_Orders_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Restore JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const orderList = Array.isArray(parsed) ? parsed : parsed.orders;
        if (Array.isArray(orderList)) {
          if (window.confirm(`Restore ${orderList.length} orders from backup? This will replace current orders.`)) {
            onRestoreBackup(orderList);
            alert('Orders restored successfully!');
          }
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Error parsing JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Business Financial & Material Summary
                </h2>
                <p className="text-xs text-slate-500">
                  Comprehensive audit of revenues, cash collected, printer owner payouts, and net profits
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <PrinterIcon className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue & Collection */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            1. Total Sales & Collection
          </span>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {formatINR(metrics.totalRevenue)}
            </div>
            <p className="text-xs text-slate-500">Gross order book value</p>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Money Collected:
              </span>
              <strong className="font-mono text-emerald-800">{formatINR(metrics.totalMoneyCollected)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Money Still Owed:
              </span>
              <strong className="font-mono text-rose-700">{formatINR(metrics.totalOwedByCustomers)}</strong>
            </div>
          </div>
        </div>

        {/* Total Production Cost & Printer Owner Payout */}
        <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200/90 shadow-2xs space-y-3">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
            2. Printer Owner Payout
          </span>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-amber-950 font-mono">
              {formatINR(metrics.totalAmountToOwner)}
            </div>
            <p className="text-xs text-amber-800 font-medium">
              Total Production Cost (Filament + Electricity)
            </p>
          </div>

          <div className="pt-2 border-t border-amber-200/80 space-y-1.5 text-xs text-amber-900">
            <div className="flex justify-between">
              <span>Filament ({metrics.totalFilamentGrams}g @ ₹1.00):</span>
              <strong className="font-mono">{formatINR(metrics.totalFilamentCost)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Electricity ({metrics.totalElectricityUnits.toFixed(2)}u @ ₹9):</span>
              <strong className="font-mono">{formatINR(metrics.totalElectricityCost)}</strong>
            </div>
          </div>
        </div>

        {/* Money Left Over / Net Profit */}
        <div className="bg-emerald-50/70 rounded-2xl p-5 border-2 border-emerald-400 shadow-2xs space-y-3">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
            3. Money Left Over (Profit)
          </span>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-emerald-800 font-mono">
              {formatINR(metrics.totalProfit)}
            </div>
            <p className="text-xs text-emerald-700 font-semibold">
              {metrics.profitMargin}% Net Margin for the School Team
            </p>
          </div>

          <div className="pt-2 border-t border-emerald-200 space-y-1.5 text-xs text-emerald-900">
            <div className="flex justify-between">
              <span>Total Orders Logged:</span>
              <strong className="font-mono">{metrics.totalOrders}</strong>
            </div>
            <div className="flex justify-between">
              <span>Active Orders:</span>
              <strong className="font-mono">{metrics.activeOrdersCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Material & Utility Audit */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Material & Energy Usage Audit</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filament Roll Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Total Filament Consumed</span>
              <span className="font-mono font-bold text-indigo-700">{metrics.totalFilamentGrams} grams</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-indigo-600 h-3 rounded-full"
                style={{ width: `${Math.min(100, (metrics.totalFilamentGrams / 1000) * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Spool size: 1,000g @ ₹1,000</span>
              <span>{(metrics.totalFilamentGrams / 1000).toFixed(2)} rolls consumed</span>
            </div>
          </div>

          {/* Electricity Units */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Total Electricity Units (kWh)</span>
              <span className="font-mono font-bold text-amber-700">{metrics.totalElectricityUnits.toFixed(2)} units</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-amber-500 h-3 rounded-full"
                style={{ width: `${Math.min(100, (metrics.totalElectricityUnits / 50) * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Rate: ₹9.00 per unit (1 kWh)</span>
              <span>Usage: 5 units / 24 hrs (₹45 / 24h)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdowns: By Class and By Product */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Class Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span>Orders by Class / Section</span>
            <span className="text-xs font-normal text-slate-500">Ranked by revenue</span>
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {classBreakdown.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No class data yet
              </div>
            ) : (
              classBreakdown.map(([cls, data]) => (
                <div key={cls} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      Class {cls}
                    </span>
                    <span className="text-slate-500">({data.count} {data.count === 1 ? 'print' : 'prints'})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-slate-900">{formatINR(data.revenue)}</span>
                    <span className="text-[11px] text-emerald-600 block">+{formatINR(data.profit)} profit</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Product Popularity Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span>Popular 3D Print Items</span>
            <span className="text-xs font-normal text-slate-500">Ranked by quantity</span>
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {productBreakdown.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No products logged yet
              </div>
            ) : (
              productBreakdown.map(([prod, data]) => (
                <div key={prod} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{prod}</span>
                    <span className="text-slate-500 block text-[11px]">
                      {data.grams}g filament used total
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono">
                      {data.count} sold
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 block font-mono mt-0.5">
                      {formatINR(data.revenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
