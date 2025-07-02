
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Order, OrderItem, MenuItem } from "@/types/order";
import { menuItems } from "@/data/menu";

interface NewOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: Order) => void;
}

const NewOrderDialog = ({ isOpen, onClose, onAddOrder }: NewOrderDialogProps) => {
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [orderNumber] = useState(() => Math.floor(Math.random() * 10000) + 1000);
  const [timestamp] = useState(() => new Date());

  const addItemToOrder = (menuItem: MenuItem) => {
    setSelectedItems(prev => {
      const existingItem = prev.find(item => item.menuItem.id === menuItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const updateItemQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setSelectedItems(prev => prev.filter(item => item.menuItem.id !== menuItemId));
    } else {
      setSelectedItems(prev =>
        prev.map(item =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + (item.menuItem.price * item.quantity),
    0
  );

  const handleCreateOrder = () => {
    if (selectedItems.length === 0) return;

    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber,
      timestamp,
      items: selectedItems,
      totalPrice
    };

    onAddOrder(newOrder);
    setSelectedItems([]);
    onClose();
  };

  const categorizedItems = {
    burgers: menuItems.filter(item => item.category === 'burgers'),
    sides: menuItems.filter(item => item.category === 'sides'),
    drinks: menuItems.filter(item => item.category === 'drinks'),
    desserts: menuItems.filter(item => item.category === 'desserts')
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            New Order #{orderNumber}
          </DialogTitle>
          <p className="text-gray-600">
            {timestamp.toLocaleString('en-GB', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Menu Items */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Menu</h3>
            
            {Object.entries(categorizedItems).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-lg font-medium text-gray-700 mb-3 capitalize">
                  {category}
                </h4>
                <div className="grid gap-3">
                  {items.map(item => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-800">{item.name}</h5>
                            <p className="text-orange-600 font-semibold">₾{item.price.toFixed(2)}</p>
                          </div>
                          <Button
                            onClick={() => addItemToOrder(item)}
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Order Summary</h3>
            
            {selectedItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items selected</p>
            ) : (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedItems.map(item => (
                    <Card key={item.menuItem.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800">
                              {item.menuItem.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              ₾{item.menuItem.price.toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => updateItemQuantity(item.menuItem.id, item.quantity - 1)}
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0"
                            >
                              -
                            </Button>
                            <Badge variant="secondary" className="px-3">
                              {item.quantity}
                            </Badge>
                            <Button
                              onClick={() => updateItemQuantity(item.menuItem.id, item.quantity + 1)}
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <span className="font-semibold text-orange-600">
                            ₾{(item.menuItem.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">₾{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCreateOrder}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 text-lg font-semibold"
                >
                  Create Order
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
