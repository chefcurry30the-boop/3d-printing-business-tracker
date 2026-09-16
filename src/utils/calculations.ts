import { Order, OrderCostBreakdown } from '../types';

export const FILAMENT_COST_PER_GRAM = 1.0; // ₹1000 / 1000g = ₹1.00 per gram
export const ELECTRICITY_COST_PER_UNIT = 9; // ₹9 per unit (1 unit = 1 kilowatt / kWh)
export const ELECTRICITY_UNITS_IN_24H = 5; // 5 units consumed in 24 hrs (5 kWh * ₹9 = ₹45 for 24 hrs)
export const ELECTRICITY_UNITS_PER_HOUR = 5 / 24; // 0.20833... units/kWh per hour of printing
export const ELECTRICITY_COST_PER_HOUR = 45 / 24; // ₹1.875 per hour of printing (24 hrs = ₹45)

/**
 * Calculates exact costs and profits for an order
 * Formula:
 * - Filament Cost = Filament Grams * ₹1.00 (₹1000 for 1kg)
 * - Electricity Units = Print Hours * (5 / 24) units/hour (1 unit = 1 kWh)
 * - Electricity Cost = Print Hours * (45 / 24) = Print Hours * ₹1.875 (₹9/unit; 24h = ₹45)
 * - Owner Payout = Filament Cost + Electricity Cost
 * - Net Profit = Selling Price - Owner Payout
 */
export function calculateOrderCosts(
  filamentGrams: number,
  printTimeHours: number,
  sellingPrice: number
): OrderCostBreakdown {
  const safeGrams = Math.max(0, Number(filamentGrams) || 0);
  const safeHours = Math.max(0, Number(printTimeHours) || 0);
  const safePrice = Math.max(0, Number(sellingPrice) || 0);

  // Filament Cost = Grams * ₹1.00
  const filamentCost = Number((safeGrams * FILAMENT_COST_PER_GRAM).toFixed(2));

  // Electricity Units = Hours * (5 / 24) units (where 1 unit = 1 kWh)
  const electricityUnits = Number((safeHours * ELECTRICITY_UNITS_PER_HOUR).toFixed(3));

  // Electricity Cost = Units * ₹9 (i.e. Hours * ₹1.875 = exactly ₹45 for 24 hours of printing)
  const electricityCost = Number((safeHours * ELECTRICITY_COST_PER_HOUR).toFixed(2));

  // Total Production Cost = Filament Cost + Electricity Cost
  const totalProductionCost = Number((filamentCost + electricityCost).toFixed(2));

  // Amount to Give Printer Owner = Total Production Cost
  const ownerPayout = totalProductionCost;

  // Money Left Over / Profit = Selling Price - Total Production Cost
  const profit = Number((safePrice - totalProductionCost).toFixed(2));

  return {
    filamentCost,
    electricityUnits,
    electricityCost,
    totalProductionCost,
    ownerPayout,
    profit,
  };
}

/**
 * Formats a number as Indian Rupee (₹)
 */
export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

/**
 * Formats time string consistently (e.g. converts 24h to 12h AM/PM if needed)
 */
export function formatTime12H(timeStr: string): string {
  if (!timeStr) return '';
  // Check if already in AM/PM format
  if (/am|pm/i.test(timeStr)) {
    return timeStr.trim();
  }
  // Otherwise parse HH:mm
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hour = parseInt(parts[0], 10);
    const minute = parts[1].padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  }
  return timeStr;
}

/**
 * Normalizes Date + Time string into a sortable Unix timestamp
 */
export function getOrderSortTimestamp(orderDate: string, orderTime: string): number {
  if (!orderDate) return 0;
  
  let hours = 0;
  let minutes = 0;
  
  if (orderTime) {
    const isPM = /pm/i.test(orderTime);
    const isAM = /am/i.test(orderTime);
    const cleanTime = orderTime.replace(/am|pm/gi, '').trim();
    const timeParts = cleanTime.split(':');
    
    if (timeParts.length >= 2) {
      hours = parseInt(timeParts[0], 10) || 0;
      minutes = parseInt(timeParts[1], 10) || 0;
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
    }
  }

  // Parse YYYY-MM-DD
  const dateParts = orderDate.split('-');
  if (dateParts.length === 3) {
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    return new Date(year, month, day, hours, minutes, 0, 0).getTime();
  }

  const fallback = new Date(orderDate).getTime();
  return isNaN(fallback) ? 0 : fallback;
}

/**
 * Computes dynamic chronological slot numbers (#1, #2, #3...) for all orders
 * based on Paper Order Date + Paper Order Time, with manual tieBreakerRank support.
 */
export function recalculateQueueSlots(orders: Order[]): Order[] {
  // Clone to avoid mutating original
  const sorted = [...orders].sort((a, b) => {
    const timeA = getOrderSortTimestamp(a.orderDate, a.orderTime);
    const timeB = getOrderSortTimestamp(b.orderDate, b.orderTime);

    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // Tie breaker if same date and time
    const rankA = a.tieBreakerRank ?? a.orderNumber ?? 0;
    const rankB = b.tieBreakerRank ?? b.orderNumber ?? 0;
    if (rankA !== rankB) {
      return rankA - rankB;
    }

    return a.orderNumber - b.orderNumber;
  });

  // Assign sequential slot numbers based on order queue
  return sorted.map((order, index) => ({
    ...order,
    slotNumber: index + 1,
  }));
}

/**
 * Helper to compute actual money collected from an order
 */
export function getMoneyCollected(order: Order): number {
  if (order.status === 'Cancelled') return 0;
  if (order.paymentStatus === 'Paid') {
    return order.sellingPrice;
  }
  if (order.paymentStatus === 'Partially Paid') {
    return Math.min(order.sellingPrice, Math.max(0, order.amountPaid || 0));
  }
  return 0;
}

/**
 * Helper to compute remaining money owed by customer for an order
 */
export function getMoneyOwed(order: Order): number {
  if (order.status === 'Cancelled') return 0;
  const collected = getMoneyCollected(order);
  return Math.max(0, order.sellingPrice - collected);
}
