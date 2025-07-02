
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Order, OrderItem, MenuItem } from "@/types/order";
import { menuItems, sauceOptions, drinkOptions } from "@/data/menu";

interface NewOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: Order) => void;
}

interface PendingItem {
  menuItem: MenuItem;
  sauce?: string;
  sauceCup?: string;
  drink?: string;
}

const NewOrderDialog = ({ isOpen, onClose, onAddOrder }: NewOrderDialogProps) => {
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null);
  const [orderNumber] = useState(() => Math.floor(Math.random() * 10000) + 1000);
  const [timestamp] = useState(() => new Date());

  const addItemToOrder = (menuItem: MenuItem) => {
    if (menuItem.requiresSauce || menuItem.isCombo) {
      setPendingItem({ menuItem });
    } else {
      addFinalItem({ menuItem, quantity: 1 });
    }
  };

  const addFinalItem = (item: OrderItem) => {
    setSelectedItems(prev => {
      const existingIndex = prev.findIndex(existing => 
        existing.menuItem.id === item.menuItem.id &&
        existing.sauce === item.sauce &&
        existing.sauceCup === item.sauceCup &&
        existing.drink === item.drink
      );
      
      if (existingIndex >= 0) {
        return prev.map((existing, index) =>
          index === existingIndex
            ? { ...existing, quantity: existing.quantity + 1 }
            : existing
        );
      }
      return [...prev, item];
    });
  };

  const confirmPendingItem = () => {
    if (!pendingItem) return;
    
    const requiredSauce = pendingItem.menuItem.requiresSauce && !pendingItem.sauce;
    const requiredDrink = (pendingItem.menuItem.isCombo || pendingItem.menuItem.name.includes('Meal')) && !pendingItem.drink;
    
    if (requiredSauce || requiredDrink) return;

    addFinalItem({
      menuItem: pendingItem.menuItem,
      quantity: 1,
      sauce: pendingItem.sauce,
      sauceCup: pendingItem.sauceCup,
      drink: pendingItem.drink
    });
    
    setPendingItem(null);
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setSelectedItems(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedItems(prev =>
        prev.map((item, i) =>
          i === index ? { ...item, quantity: newQuantity } : item
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
    setPendingItem(null);
    onClose();
  };

  const categorizedItems = {
    mains: menuItems.filter(item => item.category === 'mains'),
    sides: menuItems.filter(item => item.category === 'sides'),
    sauces: menuItems.filter(item => item.category === 'sauces'),
    drinks: menuItems.filter(item => item.category === 'drinks'),
    addons: menuItems.filter(item => item.category === 'addons')
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
                  {category === 'mains' ? 'Burgers & Wraps' : 
                   category === 'sides' ? 'Bites & Sides' :
                   category === 'addons' ? 'Add-ons' : category}
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
            
            {/* Pending Item Configuration */}
            {pendingItem && (
              <Card className="border-orange-500 border-2">
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Configure: {pendingItem.menuItem.name}</h4>
                  
                  {pendingItem.menuItem.requiresSauce && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sauce *
                      </label>
                      <Select value={pendingItem.sauce} onValueChange={(value) => 
                        setPendingItem(prev => prev ? {...prev, sauce: value} : null)
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sauce" />
                        </SelectTrigger>
                        <SelectContent>
                          {sauceOptions.map(sauce => (
                            <SelectItem key={sauce} value={sauce}>{sauce}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {pendingItem.menuItem.isCombo && (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sauce Cup
                        </label>
                        <Select value={pendingItem.sauceCup} onValueChange={(value) => 
                          setPendingItem(prev => prev ? {...prev, sauceCup: value} : null)
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sauce cup (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {sauceOptions.map(sauce => (
                              <SelectItem key={sauce} value={sauce}>{sauce}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Drink *
                        </label>
                        <Select value={pendingItem.drink} onValueChange={(value) => 
                          setPendingItem(prev => prev ? {...prev, drink: value} : null)
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Select drink" />
                          </SelectTrigger>
                          <SelectContent>
                            {drinkOptions.map(drink => (
                              <SelectItem key={drink} value={drink}>{drink}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {pendingItem.menuItem.name.includes('Meal') && !pendingItem.menuItem.isCombo && (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sauce Cup
                        </label>
                        <Select value={pendingItem.sauceCup} onValueChange={(value) => 
                          setPendingItem(prev => prev ? {...prev, sauceCup: value} : null)
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sauce cup (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {sauceOptions.map(sauce => (
                              <SelectItem key={sauce} value={sauce}>{sauce}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Drink *
                        </label>
                        <Select value={pendingItem.drink} onValueChange={(value) => 
                          setPendingItem(prev => prev ? {...prev, drink: value} : null)
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Select drink" />
                          </SelectTrigger>
                          <SelectContent>
                            {drinkOptions.map(drink => (
                              <SelectItem key={drink} value={drink}>{drink}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div className="flex space-x-2">
                    <Button onClick={confirmPendingItem} className="bg-green-500 hover:bg-green-600">
                      Add to Order
                    </Button>
                    <Button onClick={() => setPendingItem(null)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedItems.length === 0 && !pendingItem ? (
              <p className="text-gray-500 text-center py-8">No items selected</p>
            ) : (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedItems.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800">
                              {item.menuItem.name}
                            </h5>
                            {item.sauce && (
                              <p className="text-sm text-gray-600">Sauce: {item.sauce}</p>
                            )}
                            {item.sauceCup && (
                              <p className="text-sm text-gray-600">Sauce Cup: {item.sauceCup}</p>
                            )}
                            {item.drink && (
                              <p className="text-sm text-gray-600">Drink: {item.drink}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              ₾{item.menuItem.price.toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => updateItemQuantity(index, item.quantity - 1)}
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
                              onClick={() => updateItemQuantity(index, item.quantity + 1)}
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
                  disabled={selectedItems.length === 0}
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
