export type OrderStatus = 'Booked' | 'Queued' | 'Printing' | 'Ready' | 'Delivered' | 'Cancelled';

export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid';

export interface OrderCostBreakdown {
  filamentCost: number;       // Grams * 1.00 (₹1000/kg)
  electricityUnits: number;   // Print Hours + 1
  electricityCost: number;    // Electricity Units * 12
  totalProductionCost: number;// Filament Cost + Electricity Cost
  ownerPayout: number;        // Same as Total Production Cost
  profit: number;             // Selling Price - Total Production Cost
}

export interface Order {
  id: string;
  orderNumber: number;        // Sequential visual order ID (e.g. 101, 102...)
  slotNumber: number;         // Chronological slot number (#1, #2, #3...) based on paper order date & time
  
  // Customer info
  customerName: string;
  classSection: string;       // e.g. "9A", "10B", "8C"
  
  // Paper Order Timestamps
  orderDate: string;          // YYYY-MM-DD from paper
  orderTime: string;          // HH:mm (or "10:05 AM") from paper
  tieBreakerRank?: number;    // For manual sorting if same date + time
  
  // App metadata
  enteredAt: string;          // ISO string when entered into app at home
  updatedAt?: string;
  
  // Product info
  productName: string;
  customName?: string;        // Optional custom text on print (e.g. "RAHUL")
  quantity: number;
  
  // Manufacturing specifications
  printTimeHours: number;     // Print time in hours (e.g. 2, 2.5)
  filamentGrams: number;      // Filament in grams (e.g. 40)
  
  // Financials
  sellingPrice: number;       // In ₹
  paymentStatus: PaymentStatus;
  amountPaid: number;         // For Partially Paid or Paid (in ₹)
  
  // Status & Notes
  status: OrderStatus;
  notes?: string;
}

export interface ProductPreset {
  id: string;
  name: string;
  category: string;
  defaultGrams: number;
  defaultHours: number;
  defaultPrice: number;
  icon?: string;
}

export type ViewTab = 'dashboard' | 'table' | 'queue' | 'orders' | 'summary';
