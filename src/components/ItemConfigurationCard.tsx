
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MenuItem } from "@/types/order";
import { sauceOptions, drinkOptions, addOnOptions } from "@/data/menu";

interface PendingItem {
  menuItem: MenuItem;
  sauce?: string;
  sauceCup?: string;
  drink?: string;
  addons: string[];
  spicy: boolean;
}

interface ItemConfigurationCardProps {
  pendingItem: PendingItem;
  onUpdatePendingItem: (updater: (prev: PendingItem | null) => PendingItem | null) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ItemConfigurationCard = ({ 
  pendingItem, 
  onUpdatePendingItem, 
  onConfirm, 
  onCancel 
}: ItemConfigurationCardProps) => {
  const isMainItem = pendingItem.menuItem.category === 'mains' || pendingItem.menuItem.category === 'value';
  
  const handleAddonChange = (addonName: string, checked: boolean) => {
    onUpdatePendingItem(prev => {
      if (!prev) return null;
      const updatedAddons = checked 
        ? [...prev.addons, addonName]
        : prev.addons.filter(addon => addon !== addonName);
      return { ...prev, addons: updatedAddons };
    });
  };

  const handleSpicyChange = (checked: boolean) => {
    onUpdatePendingItem(prev => prev ? { ...prev, spicy: checked } : null);
  };

  const calculateAddonPrice = () => {
    return pendingItem.addons.reduce((total, addon) => {
      const addonOption = addOnOptions.find(option => option.name === addon);
      return total + (addonOption?.price || 0);
    }, 0);
  };

  const totalPrice = pendingItem.menuItem.price + calculateAddonPrice();

  return (
    <Card className="border-orange-500 border-2">
      <CardContent className="p-4">
        <h4 className="font-medium text-gray-800 mb-3">
          Configure: {pendingItem.menuItem.name}
          <span className="text-orange-600 ml-2">₾{totalPrice.toFixed(2)}</span>
        </h4>
        
        {pendingItem.menuItem.requiresSauce && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sauce *
            </label>
            <Select 
              value={pendingItem.sauce} 
              onValueChange={(value) => 
                onUpdatePendingItem(prev => prev ? {...prev, sauce: value} : null)
              }
            >
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
              <Select 
                value={pendingItem.sauceCup} 
                onValueChange={(value) => 
                  onUpdatePendingItem(prev => prev ? {...prev, sauceCup: value} : null)
                }
              >
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
              <Select 
                value={pendingItem.drink} 
                onValueChange={(value) => 
                  onUpdatePendingItem(prev => prev ? {...prev, drink: value} : null)
                }
              >
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
              <Select 
                value={pendingItem.sauceCup} 
                onValueChange={(value) => 
                  onUpdatePendingItem(prev => prev ? {...prev, sauceCup: value} : null)
                }
              >
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
              <Select 
                value={pendingItem.drink} 
                onValueChange={(value) => 
                  onUpdatePendingItem(prev => prev ? {...prev, drink: value} : null)
                }
              >
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

        {isMainItem && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add-ons
            </label>
            <div className="space-y-2">
              {addOnOptions.map(addon => (
                <div key={addon.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={addon.name}
                    checked={pendingItem.addons.includes(addon.name)}
                    onCheckedChange={(checked) => handleAddonChange(addon.name, checked as boolean)}
                  />
                  <label htmlFor={addon.name} className="text-sm text-gray-700">
                    {addon.name} (+₾{addon.price.toFixed(2)})
                  </label>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="spicy"
                  checked={pendingItem.spicy}
                  onCheckedChange={(checked) => handleSpicyChange(checked as boolean)}
                />
                <label htmlFor="spicy" className="text-sm text-gray-700">
                  Spicy (Free)
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button onClick={onConfirm} className="bg-green-500 hover:bg-green-600">
            Add to Order
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemConfigurationCard;
