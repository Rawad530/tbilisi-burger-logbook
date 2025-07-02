
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'burgers' | 'sides' | 'drinks' | 'desserts';
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  timestamp: Date;
  items: OrderItem[];
  totalPrice: number;
}
