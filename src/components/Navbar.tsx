import React from 'react';
import { ViewTab } from '../types';
import { 
  Printer, 
  LayoutDashboard, 
  Table as TableIcon, 
  ListOrdered, 
  ClipboardList, 
  TrendingUp, 
  Plus, 
  FileText,
  FileImage,
  Camera
} from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenAddModal: () => void;
  onOpenDocumentViewer?: () => void;
  hasUploadedDocument?: boolean;
  queuedCount: number;
  printingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
  onOpenDocumentViewer,
  hasUploadedDocument,
  queuedCount,
  printingCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base sm:text-lg leading-tight tracking-tight">
                  3D Print Tracker
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  School Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Paper Orders • Queue Slot System • Owner Payout & Profit
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              id="nav-tab-dashboard"
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              id="nav-tab-table"
              onClick={() => onTabChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                currentTab === 'table'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Spreadsheet Grid</span>
            </button>

            <button
              id="nav-tab-queue"
              onClick={() => onTabChange('queue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all relative ${
                currentTab === 'queue'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Queue</span>
              {(queuedCount > 0 || printingCount > 0) && (
                <span className="flex items-center gap-1 ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {printingCount > 0 ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping inline-block" />
                  ) : null}
                  {queuedCount + printingCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-orders"
              onClick={() => onTabChange('orders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                currentTab === 'orders'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Cards
            </button>

            <button
              id="nav-tab-summary"
              onClick={() => onTabChange('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                currentTab === 'summary'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Financials
            </button>
          </nav>

          {/* Action Buttons: Screenshot Assistant & Add Paper Order */}
          <div className="flex items-center gap-2">
            {onOpenDocumentViewer && (
              <button
                id="btn-navbar-screenshot-viewer"
                onClick={onOpenDocumentViewer}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                  hasUploadedDocument 
                    ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-xs' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
                title="Open Screenshot / PDF assistant to paste or inspect order slips"
              >
                <Camera className={`w-4 h-4 ${hasUploadedDocument ? 'text-purple-700' : 'text-slate-600'}`} />
                <span className="hidden lg:inline">{hasUploadedDocument ? 'View Slip Screenshot' : 'Slip / Screenshot'}</span>
              </button>
            )}

            <button
              id="btn-add-paper-order"
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Enter Paper Order</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 py-1.5 shadow-lg">
        <div className="grid grid-cols-5 gap-1">
          <button
            id="mobile-nav-dashboard"
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              currentTab === 'dashboard'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Dash</span>
          </button>

          <button
            id="mobile-nav-table"
            onClick={() => onTabChange('table')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              currentTab === 'table'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TableIcon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Ledger</span>
          </button>

          <button
            id="mobile-nav-queue"
            onClick={() => onTabChange('queue')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors relative ${
              currentTab === 'queue'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <ListOrdered className="w-4 h-4 mb-0.5" />
              {(queuedCount > 0 || printingCount > 0) && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {queuedCount + printingCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Queue</span>
          </button>

          <button
            id="mobile-nav-orders"
            onClick={() => onTabChange('orders')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              currentTab === 'orders'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Cards</span>
          </button>

          <button
            id="mobile-nav-summary"
            onClick={() => onTabChange('summary')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              currentTab === 'summary'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Profit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
