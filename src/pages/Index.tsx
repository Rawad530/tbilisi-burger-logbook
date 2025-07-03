
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, Receipt, CheckCircle } from "lucide-react";
import NewOrderDialog from "@/components/NewOrderDialog";
import OrdersList from "@/components/OrdersList";
import HistorySection from "@/components/HistorySection";
import { Order } from "@/types/order";
import { saveOrdersToStorage, loadOrdersFromStorage, backupToCloud } from "@/utils/orderUtils";

const Index = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  useEffect(() => {
    const loadedOrders = loadOrdersFromStorage();
    setOrders(loadedOrders);
    
    // Auto-backup every hour
    const backupInterval = setInterval(() => {
      if (loadedOrders.length > 0) {
        backupToCloud(loadedOrders);
      }
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(backupInterval);
  }, []);

  const addOrder = (order: Order) => {
    const newOrders = [order, ...orders];
    setOrders(newOrders);
    saveOrdersToStorage(newOrders);
    
    // Auto-backup when new order is added
    setTimeout(() => backupToCloud(newOrders), 1000);
  };

  const completeOrder = (orderId: string) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: 'completed' as const } : order
    );
    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
    
    // Auto-backup when order status changes
    setTimeout(() => backupToCloud(updatedOrders), 1000);
  };

  const updateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    saveOrdersToStorage(newOrders);
  };

  // Filter today's orders for the main dashboard
  const todaysOrders = orders.filter(order => {
    const today = new Date().toDateString();
    return new Date(order.timestamp).toDateString() === today;
  });

  const preparingOrders = todaysOrders.filter(order => order.status === 'preparing');
  const completedTodayOrders = todaysOrders.filter(order => order.status === 'completed');
  const todaysRevenue = completedTodayOrders.reduce((sum, order) => sum + order.totalPrice, 0);

  // All-time statistics
  const allCompletedOrders = orders.filter(order => order.status === 'completed');
  const totalRevenue = allCompletedOrders.reduce((sum, order) => sum + order.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Daily Orders Log
          </h1>
          <p className="text-gray-600">Tbilisi Burger Restaurant Management System</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Being Prepared
              </CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">
                {preparingOrders.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completed Today
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">
                {completedTodayOrders.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Today's Revenue
              </CardTitle>
              <Receipt className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">
                ₾{todaysRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <Receipt className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">
                ₾{totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                All Orders
              </CardTitle>
              <Receipt className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">
                {orders.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Order Button */}
        <div className="mb-8">
          <Button
            onClick={() => setIsNewOrderOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <Plus className="mr-2 h-6 w-6" />
            New Order
          </Button>
        </div>

        {/* Today's Active Orders - Only show preparing orders */}
        <OrdersList 
          orders={preparingOrders} 
          onCompleteOrder={completeOrder} 
        />

        {/* History Section - Collapsible with all orders */}
        <HistorySection 
          orders={orders}
          onOrdersUpdate={updateOrders}
        />

        {/* New Order Dialog */}
        <NewOrderDialog
          isOpen={isNewOrderOpen}
          onClose={() => setIsNewOrderOpen(false)}
          onAddOrder={addOrder}
        />
      </div>
    </div>
  );
};

export default Index;
