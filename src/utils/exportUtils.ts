
import { Order } from "@/types/order";

export const exportOrdersToCSV = (orders: Order[], filename?: string) => {
  const headers = [
    'Order Number',
    'Date',
    'Time',
    'Items',
    'Quantities',
    'Sauces',
    'Drinks',
    'Total Price',
    'Status'
  ];

  const csvContent = [
    headers.join(','),
    ...orders.map(order => [
      order.orderNumber,
      order.timestamp.toLocaleDateString('en-GB'),
      order.timestamp.toLocaleTimeString('en-GB'),
      order.items.map(item => item.menuItem.name).join('; '),
      order.items.map(item => `${item.menuItem.name}(${item.quantity})`).join('; '),
      order.items.map(item => item.sauce || 'None').join('; '),
      order.items.map(item => item.drink || 'None').join('; '),
      `₾${order.totalPrice.toFixed(2)}`,
      order.status
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `orders_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return csvContent;
};

export const generateOrderSummary = (orders: Order[]) => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrders = orders.length;
  
  const itemCounts: { [key: string]: number } = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      itemCounts[item.menuItem.name] = (itemCounts[item.menuItem.name] || 0) + item.quantity;
    });
  });
  
  const mostPopularItem = Object.entries(itemCounts)
    .sort(([,a], [,b]) => b - a)[0];

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    mostPopularItem: mostPopularItem ? mostPopularItem[0] : 'None',
    mostPopularItemCount: mostPopularItem ? mostPopularItem[1] : 0,
    dateRange: orders.length > 0 ? {
      from: new Date(Math.min(...orders.map(o => o.timestamp.getTime()))),
      to: new Date(Math.max(...orders.map(o => o.timestamp.getTime())))
    } : null
  };
};

// Email backup functionality
export const sendEmailBackup = async (orders: Order[], email: string) => {
  try {
    const csvContent = exportOrdersToCSV(orders, `saucer_burger_backup_${new Date().toISOString().split('T')[0]}.csv`);
    
    // Create a mailto link with the CSV content
    const subject = encodeURIComponent(`Saucer Burger - Orders Backup ${new Date().toLocaleDateString()}`);
    const body = encodeURIComponent(`Hello,

Please find attached the orders backup for Saucer Burger.

Backup Details:
- Total Orders: ${orders.length}
- Total Revenue: ₾${orders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}
- Backup Date: ${new Date().toLocaleString()}

CSV Data:
${csvContent}

Best regards,
Saucer Burger Management System`);
    
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    
    // Open the user's email client
    window.open(mailtoLink);
    
    return true;
  } catch (error) {
    console.error('Failed to send email backup:', error);
    return false;
  }
};

// Cloud backup functionality (using localStorage as fallback)
export const backupToCloud = async (orders: Order[]) => {
  try {
    // For now, we'll use localStorage with timestamp-based backups
    const backup = {
      timestamp: new Date().toISOString(),
      orders: orders,
      version: '1.0'
    };
    
    localStorage.setItem(`burger_orders_backup_${Date.now()}`, JSON.stringify(backup));
    console.log('Orders backed up successfully');
    
    // Clean up old backups - keep only last 10
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('burger_orders_backup_'))
      .sort()
      .reverse();
    
    if (backupKeys.length > 10) {
      backupKeys.slice(10).forEach(key => localStorage.removeItem(key));
    }
    
    // Also send email backup
    await sendEmailBackup(orders, 'rawad.jalwan@hotmail.com');
    
    return true;
  } catch (error) {
    console.error('Failed to backup orders:', error);
    return false;
  }
};

export const restoreFromCloud = async (): Promise<Order[] | null> => {
  try {
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('burger_orders_backup_'))
      .sort()
      .reverse();
    
    if (backupKeys.length === 0) return null;
    
    const latestBackup = localStorage.getItem(backupKeys[0]);
    if (!latestBackup) return null;
    
    const backup = JSON.parse(latestBackup);
    return backup.orders.map((order: any) => ({
      ...order,
      timestamp: new Date(order.timestamp)
    }));
  } catch (error) {
    console.error('Failed to restore orders:', error);
    return null;
  }
};
