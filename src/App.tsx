import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, PaymentStatus, ViewTab } from './types';
import { 
  loadOrdersFromStorage, 
  saveOrdersToStorage 
} from './utils/storage';
import { recalculateQueueSlots } from './utils/calculations';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TableView } from './components/TableView';
import { QueueView } from './components/QueueView';
import { OrdersList } from './components/OrdersList';
import { BusinessSummary } from './components/BusinessSummary';
import { AddOrderModal } from './components/AddOrderModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { EditOrderModal } from './components/EditOrderModal';
import { DeliverySlipModal } from './components/DeliverySlipModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';

export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTab, setCurrentTab] = useState<ViewTab>('table');
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deliverySlipOrder, setDeliverySlipOrder] = useState<Order | null>(null);

  // Document / Screenshot Viewer state
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'image' | 'pdf' | null>(null);

  // Initial load
  useEffect(() => {
    const loaded = loadOrdersFromStorage();
    setOrders(loaded);
    setIsLoaded(true);
  }, []);

  // Save on change
  useEffect(() => {
    if (isLoaded) {
      saveOrdersToStorage(orders);
    }
  }, [orders, isLoaded]);

  // Handler: Add Order
  const handleAddOrder = (
    newOrderData: Omit<Order, 'id' | 'orderNumber' | 'slotNumber'>,
    keepOpen: boolean = false
  ) => {
    const nextOrderNumber = orders.length > 0 
      ? Math.max(...orders.map(o => o.orderNumber || 100)) + 1 
      : 101;

    const newOrder: Order = {
      ...newOrderData,
      id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      orderNumber: nextOrderNumber,
      slotNumber: orders.length + 1,
      tieBreakerRank: Date.now(),
    };

    const updated = recalculateQueueSlots([...orders, newOrder]);
    setOrders(updated);

    if (!keepOpen) {
      setIsAddModalOpen(false);
    }
  };

  // Handler: Edit Order
  const handleSaveEditedOrder = (updatedOrder: Order) => {
    const updatedList = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    const reSlot = recalculateQueueSlots(updatedList);
    setOrders(reSlot);
    if (selectedOrder?.id === updatedOrder.id) {
      const refreshed = reSlot.find(o => o.id === updatedOrder.id) || null;
      setSelectedOrder(refreshed);
    }
    setEditingOrder(null);
  };

  // Handler: Update Status
  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map(o => (o.id === orderId ? { ...o, status } : o));
    setOrders(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  // Handler: Update Payment
  const handleUpdatePayment = (orderId: string, paymentStatus: PaymentStatus, amountPaid?: number) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentStatus,
          amountPaid: amountPaid !== undefined ? amountPaid : o.amountPaid,
        };
      }
      return o;
    });
    setOrders(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        paymentStatus,
        amountPaid: amountPaid !== undefined ? amountPaid : selectedOrder.amountPaid,
      });
    }
  };

  // Handler: Delete Order
  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order from the system?')) {
      const remaining = orders.filter(o => o.id !== orderId);
      const reSlot = recalculateQueueSlots(remaining);
      setOrders(reSlot);
      setSelectedOrder(null);
    }
  };

  // Handler: Swap Tie Breaker rank when two orders have same date & time
  const handleSwapTieBreaker = (orderAId: string, orderBId: string) => {
    const orderA = orders.find(o => o.id === orderAId);
    const orderB = orders.find(o => o.id === orderBId);
    if (!orderA || !orderB) return;

    const rankA = orderA.tieBreakerRank ?? orderA.orderNumber;
    const rankB = orderB.tieBreakerRank ?? orderB.orderNumber;

    const updated = orders.map(o => {
      if (o.id === orderAId) return { ...o, tieBreakerRank: rankB };
      if (o.id === orderBId) return { ...o, tieBreakerRank: rankA };
      return o;
    });

    setOrders(recalculateQueueSlots(updated));
  };

  // Handler: Restore backup
  const handleRestoreBackup = (restoredOrders: Order[]) => {
    const reSlot = recalculateQueueSlots(restoredOrders);
    setOrders(reSlot);
  };

  // Handler: Document upload
  const handleUploadDocument = (file: File) => {
    const url = URL.createObjectURL(file);
    setDocumentUrl(url);
    setDocumentName(file.name);
    setDocumentType(file.type.includes('pdf') ? 'pdf' : 'image');
  };

  const handleClearDocument = () => {
    if (documentUrl) {
      URL.revokeObjectURL(documentUrl);
    }
    setDocumentUrl(null);
    setDocumentName(null);
    setDocumentType(null);
  };

  const queuedCount = orders.filter(o => o.status === 'Queued' || o.status === 'Booked').length;
  const printingCount = orders.filter(o => o.status === 'Printing').length;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenDocumentViewer={() => setIsDocumentModalOpen(true)}
        hasUploadedDocument={!!documentUrl}
        queuedCount={queuedCount}
        printingCount={printingCount}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            orders={orders}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenDocumentViewer={() => setIsDocumentModalOpen(true)}
            hasUploadedDocument={!!documentUrl}
            onSelectOrder={setSelectedOrder}
            onUpdateStatus={handleUpdateStatus}
            onViewTab={setCurrentTab}
          />
        )}

        {currentTab === 'table' && (
          <TableView
            orders={orders}
            onSelectOrder={setSelectedOrder}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onEditOrder={(ord) => setEditingOrder(ord)}
            onDeleteOrder={handleDeleteOrder}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePayment={handleUpdatePayment}
            onPrintSlip={(ord) => setDeliverySlipOrder(ord)}
            onOpenDocumentViewer={() => setIsDocumentModalOpen(true)}
            hasUploadedDocument={!!documentUrl}
          />
        )}

        {currentTab === 'queue' && (
          <QueueView
            orders={orders}
            onSelectOrder={setSelectedOrder}
            onUpdateStatus={handleUpdateStatus}
            onSwapTieBreaker={handleSwapTieBreaker}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {currentTab === 'orders' && (
          <OrdersList
            orders={orders}
            onSelectOrder={setSelectedOrder}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePayment={handleUpdatePayment}
          />
        )}

        {currentTab === 'summary' && (
          <BusinessSummary
            orders={orders}
            onRestoreBackup={handleRestoreBackup}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddOrder={handleAddOrder}
      />

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onEdit={(ord) => {
            setSelectedOrder(null);
            setEditingOrder(ord);
          }}
          onDelete={handleDeleteOrder}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePayment={handleUpdatePayment}
          onPrintSlip={(ord) => setDeliverySlipOrder(ord)}
        />
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveEditedOrder}
        />
      )}

      {deliverySlipOrder && (
        <DeliverySlipModal
          order={deliverySlipOrder}
          onClose={() => setDeliverySlipOrder(null)}
        />
      )}

      {/* Document / Screenshot Assistant Modal */}
      <DocumentViewerModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        documentUrl={documentUrl}
        documentName={documentName}
        documentType={documentType}
        onUploadDocument={handleUploadDocument}
        onClearDocument={handleClearDocument}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />
    </div>
  );
}
