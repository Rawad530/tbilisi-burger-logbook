
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MenuItem } from "@/types/order";
import { sauceOptions, drinkOptions } from "@/data/menu";

interface PendingItem {
  menuItem: MenuItem;
  sauce?: string;
  sauceCup?: string;
  drink?: string;
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
  return (
    <Card className="border-orange-500 border-2">
      <CardContent className="p-4">
        <h4 className="font-medium text-gray-800 mb-3">Configure: {pendingItem.menuItem.name}</h4>
        
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
