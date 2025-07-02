
const ORDER_STORAGE_KEY = 'burger_orders';
const ORDER_COUNTER_KEY = 'burger_order_counter';

export const saveOrdersToStorage = (orders: any[]) => {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Failed to save orders to storage:', error);
  }
};

export const loadOrdersFromStorage = () => {
  try {
    const stored = localStorage.getItem(ORDER_STORAGE_KEY);
    if (stored) {
      const orders = JSON.parse(stored);
      return orders.map((order: any) => ({
        ...order,
        timestamp: new Date(order.timestamp)
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to load orders from storage:', error);
    return [];
  }
};

export const getNextOrderNumber = (): number => {
  try {
    const stored = localStorage.getItem(ORDER_COUNTER_KEY);
    const currentCounter = stored ? parseInt(stored, 10) : 1000;
    const nextNumber = currentCounter + 1;
    localStorage.setItem(ORDER_COUNTER_KEY, nextNumber.toString());
    return nextNumber;
  } catch (error) {
    console.error('Failed to get next order number:', error);
    return Math.floor(Math.random() * 10000) + 1000;
  }
};

export const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
