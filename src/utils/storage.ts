import { Order, ProductPreset } from '../types';
import { recalculateQueueSlots } from './calculations';

const STORAGE_KEY_ORDERS = 'school_3d_print_orders_v1';
const STORAGE_KEY_SETTINGS = 'school_3d_print_settings_v1';

// Default product presets for quick 1-tap fill
export const DEFAULT_PRODUCT_PRESETS: ProductPreset[] = [
  {
    id: 'fidget-cube',
    name: 'Fidget Cube',
    category: 'Toys',
    defaultGrams: 40,
    defaultHours: 2.0,
    defaultPrice: 100,
    icon: '📦',
  },
  {
    id: 'flexi-rex',
    name: 'Flexi Dinosaur',
    category: 'Toys',
    defaultGrams: 35,
    defaultHours: 1.5,
    defaultPrice: 80,
    icon: '🦖',
  },
  {
    id: 'articulated-dragon',
    name: 'Articulated Dragon',
    category: 'Toys',
    defaultGrams: 85,
    defaultHours: 4.5,
    defaultPrice: 250,
    icon: '🐉',
  },
  {
    id: 'name-keychain',
    name: 'Custom Name Keychain',
    category: 'Accessories',
    defaultGrams: 15,
    defaultHours: 0.75,
    defaultPrice: 50,
    icon: '🏷️',
  },
  {
    id: 'spinning-gyro',
    name: 'Spinning Gyroscope',
    category: 'Fidget',
    defaultGrams: 25,
    defaultHours: 1.2,
    defaultPrice: 70,
    icon: '🌀',
  },
  {
    id: 'pencil-topper',
    name: 'Pencil Charm / Topper',
    category: 'Stationery',
    defaultGrams: 8,
    defaultHours: 0.4,
    defaultPrice: 30,
    icon: '✏️',
  },
  {
    id: 'phone-stand',
    name: 'Foldable Phone Stand',
    category: 'Utility',
    defaultGrams: 50,
    defaultHours: 2.5,
    defaultPrice: 120,
    icon: '📱',
  },
  {
    id: 'gear-ring',
    name: 'Gear / Fidget Ring',
    category: 'Fidget',
    defaultGrams: 12,
    defaultHours: 0.6,
    defaultPrice: 40,
    icon: '💍',
  },
];

export const INITIAL_SAMPLE_ORDERS: Order[] = [];

export function loadOrdersFromStorage(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any legacy sample orders that might have been saved in browser previously
      const nonSampleOrders = parsed.filter((o: Order) => !o.id?.startsWith('ord-sample-'));
      if (nonSampleOrders.length !== parsed.length) {
        saveOrdersToStorage(nonSampleOrders);
      }
      return recalculateQueueSlots(nonSampleOrders);
    }
    return [];
  } catch (e) {
    console.error('Error loading orders from storage', e);
    return [];
  }
}

export function clearAllOrdersFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ORDERS);
  } catch (e) {
    console.error('Error clearing orders from storage', e);
  }
}

export function saveOrdersToStorage(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders to storage', e);
  }
}

export function exportOrdersBackupJSON(orders: Order[]): string {
  const payload = {
    exportedAt: new Date().toISOString(),
    appName: '3D Print Order & Queue Tracker',
    version: '1.0',
    totalOrders: orders.length,
    orders,
  };
  return JSON.stringify(payload, null, 2);
}
