
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Receipt } from "lucide-react";
import { Order } from "@/types/order";

interface OrdersListProps {
  orders: Order[];
}

const OrdersList = ({ orders }: OrdersListProps) => {
  if (orders.length === 0) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-8 text-center">
          <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
          <p className="text-gray-500">Click "New Order" to create your first order</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Orders</h2>
      
      {orders.map(order => (
        <Card key={order.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">
                  Order #{order.orderNumber}
                </CardTitle>
                <div className="flex items-center text-gray-600 mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {order.timestamp.toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                ₾{order.totalPrice.toFixed(2)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Items:</h4>
              <div className="grid gap-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-800">{item.menuItem.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        x{item.quantity}
                      </Badge>
                    </div>
                    <span className="text-orange-600 font-semibold">
                      ₾{(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrdersList;
