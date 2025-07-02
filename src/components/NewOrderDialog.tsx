
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order, OrderItem, MenuItem } from "@/types/order";
import { menuItems } from "@/data/menu";
import MenuSection from "./MenuSection";
import OrderSummary from "./OrderSummary";

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

  const categoryTitles = {
    mains: 'Burgers & Wraps',
    sides: 'Bites & Sides',
    sauces: 'Sauces',
    drinks: 'Drinks',
    addons: 'Add-ons'
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
              <MenuSection
                key={category}
                title={categoryTitles[category as keyof typeof categoryTitles]}
                items={items}
                onAddItem={addItemToOrder}
              />
            ))}
          </div>

          {/* Order Summary */}
          <OrderSummary
            selectedItems={selectedItems}
            pendingItem={pendingItem}
            totalPrice={totalPrice}
            onUpdateItemQuantity={updateItemQuantity}
            onUpdatePendingItem={setPendingItem}
            onConfirmPendingItem={confirmPendingItem}
            onCancelPendingItem={() => setPendingItem(null)}
            onCreateOrder={handleCreateOrder}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
