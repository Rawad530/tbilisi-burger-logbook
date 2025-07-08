
import { Order } from "@/types/order";

export const exportOrdersToCSV = (orders: Order[], filename?: string) => {
  const headers = [
    'Order ID',
    'Order Timestamp',
    'Main Item',
    'Protein',
    'Load',
    'Type',
    'Sauce',
    'Drink',
    'Side Sauce',
    'Add Ons',
    'Price (GEL)'
  ];

  const csvContent = [
    headers.join(','),
    ...orders.flatMap(order =>
      order.items.map(item => {
        const { mainItem, protein, load, type } = parseItemDetails(item.menuItem.name);
        const addons = Array.isArray(item.addons) ? [...item.addons] : [];
        if (item.spicy) addons.push('Spicy');
        
        return [
          order.orderNumber,
          order.timestamp.toLocaleString('en-GB'),
          mainItem,
          protein,
          load,
          type,
          item.sauce || 'N/A',
          type === 'Combo' ? (item.drink || 'N/A') : 'N/A',
          type === 'Combo' ? (item.sauceCup || 'N/A') : 'N/A',
          addons.length > 0 ? addons.join(', ') : 'N/A',
          `₾${(item.menuItem.price * item.quantity).toFixed(2)}`
        ].map(field => `"${field}"`).join(',');
      })
    )
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
        const addons = Array.isArray(item.addons) ? [...item.addons] : [];
        if (item.spicy) addons.push('Spicy');
        
        return `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${order.orderNumber}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${order.timestamp.toLocaleString('en-GB')}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${mainItem}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${protein}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${load}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${type}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.sauce || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${type === 'Combo' ? (item.drink || 'N/A') : 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${type === 'Combo' ? (item.sauceCup || 'N/A') : 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${addons.length > 0 ? addons.join(', ') : 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₾${(item.menuItem.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      })
    ).join('');

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalItems = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    const htmlTable = `
      <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Saucer Burger - Orders Backup</h2>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #555;">Backup Summary</h3>
          <p style="margin: 5px 0;"><strong>Total Orders:</strong> ${orders.length}</p>
          <p style="margin: 5px 0;"><strong>Total Items:</strong> ${totalItems}</p>
          <p style="margin: 5px 0;"><strong>Total Revenue:</strong> ₾${totalRevenue.toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>Backup Date:</strong> ${new Date().toLocaleString('en-GB')}</p>
        </div>

        <table style="border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 12px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Order ID</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Order Timestamp</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Main Item</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Protein</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Load</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Type</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Sauce</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Drink</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Side Sauce</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Add Ons</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">Price (GEL)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <p style="margin: 0; color: #666; font-size: 14px;">Generated by Saucer Burger Management System</p>
        </div>
      </div>
    `;
    
    const subject = encodeURIComponent(`Saucer Burger - Orders Backup ${new Date().toLocaleDateString('en-GB')}`);
    const body = encodeURIComponent(`Hello,

Please find the detailed orders backup for Saucer Burger below.

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
    
    // Send email backup
    const emailSent = await sendEmailBackup(orders, 'rawad.jalwan@hotmail.com');
    
    if (!emailSent) {
      throw new Error('Failed to send email backup');
    }
    
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
