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
    'Add-ons',
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
      order.items.map(item => {
        const addons = [...item.addons];
        if (item.spicy) addons.push('Spicy');
        return addons.length > 0 ? addons.join(', ') : 'None';
      }).join('; '),
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

const parseItemDetails = (itemName: string) => {
  const isWrap = itemName.toLowerCase().includes('wrap');
  const mainItem = isWrap ? 'Wrap' : 'Burger';
  
  const isChicken = itemName.toLowerCase().includes('chicken');
  const isBeef = itemName.toLowerCase().includes('beef');
  const protein = isChicken ? 'Chicken' : isBeef ? 'Beef' : 'N/A';
  
  const isDouble = itemName.toLowerCase().includes('double');
  const load = isDouble ? 'Double' : 'Single';
  
  const isCombo = itemName.toLowerCase().includes('combo');
  const type = isCombo ? 'Combo' : 'A la carte';
  
  return { mainItem, protein, load, type };
};

// Email backup functionality with HTML table
export const sendEmailBackup = async (orders: Order[], email: string) => {
  try {
    const tableRows = orders.flatMap(order =>
      order.items.map(item => {
        const { mainItem, protein, load, type } = parseItemDetails(item.menuItem.name);
        const addons = [...item.addons];
        if (item.spicy) addons.push('Spicy');
        
        return `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${order.orderNumber}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${order.timestamp.toLocaleDateString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${mainItem}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${protein}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${load}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${type}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.sauce || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${type === 'Combo' ? (item.drink || 'N/A') : 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${type === 'Combo' ? (item.sauceCup || 'N/A') : 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${addons.length > 0 ? addons.join(', ') : 'None'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">₾${(item.menuItem.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      })
    ).join('');

    const htmlTable = `
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="border: 1px solid #ddd; padding: 8px;">Order #</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Main Item</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Protein</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Load</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Type</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Sauce</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Drink</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Side Sauce</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Add-ons</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Qty</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
    
    const subject = encodeURIComponent(`Saucer Burger - Orders Backup ${new Date().toLocaleDateString()}`);
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    const body = encodeURIComponent(`Hello,

Please find the detailed orders backup for Saucer Burger below.

Backup Details:
- Total Orders: ${orders.length}
- Total Revenue: ₾${totalRevenue.toFixed(2)}
- Backup Date: ${new Date().toLocaleString()}

${htmlTable}

Best regards,
Saucer Burger Management System`);
    
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
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
