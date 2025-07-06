
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'mains' | 'sides' | 'sauces' | 'drinks' | 'addons' | 'value';
  requiresSauce?: boolean;
  isCombo?: boolean;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  sauce?: string;
  sauceCup?: string;
  drink?: string;
}

export type OrderStatus = 'preparing' | 'completed';

export interface Order {
  id: string;
  orderNumber: number;
  timestamp: Date;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
}
