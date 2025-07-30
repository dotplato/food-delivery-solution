'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MenuItem as MenuItemType, MenuItemOption, MenuItemAddon, MealOption, Category } from '@/lib/types';
import { useCart } from '@/context/cart-context';
import { MenuItemDialog } from './menu-item-dialog';
import { Plus, Star } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { isRestaurantOpen } from '@/lib/restaurant-hours';

interface MenuItemProps {
  item: MenuItemType;
  category?: Category;
  addons: any[];
  mealOptions: any[];
  sauces: any[];
  categorySauces: any[];
}

export function MenuItem({ item, category, addons, mealOptions, sauces, categorySauces }: MenuItemProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddToCart = (selectedOptions: {
    selectedOption?: MenuItemOption;
    selectedAddons: MenuItemAddon[];
    selectedMealOptions?: MealOption[];
  }) => {
    let totalPrice = item.price;

    if (selectedOptions.selectedOption) {
      totalPrice += selectedOptions.selectedOption.price_adjustment;
    }
    selectedOptions.selectedAddons.forEach(addon => {
      totalPrice += addon.price_adjustment;
    });
    selectedOptions.selectedMealOptions?.forEach(option => {
      totalPrice += option.price_adjustment;
    });

    addToCart({
      ...item,
      price: totalPrice
    }, selectedOptions);
  };

  const handleOpenDialog = () => {
    if (!user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/signin?redirect=/menu';
      }
      return;
    }
    
    if (!isRestaurantOpen()) {
      // Show toast or alert that restaurant is closed
      alert('Sorry, the restaurant is currently closed. Please try again during our opening hours.');
      return;
    }
    
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border-0 shadow-sm bg-white flex flex-col h-full">
        <div className="relative">
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={item.image_url && item.image_url.trim() !== "" ? item.image_url : "/logos/logo-gray.png"}
              alt={item.name}
              className="object-cover w-full h-full transition-transform duration-200 hover:scale-105"
            />
            {item.featured && (
              <Badge className="absolute top-2 left-2 bg-yellow-500 text-white border-0">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">{item.name}</h3>
            <span className="text-lg font-bold text-red-700 ml-2 flex-shrink-0">${item.price.toFixed(2)}</span>
          </div>
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed flex-1">{item.description}</p>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
          <Button
            onClick={handleOpenDialog}
            className={`w-full font-medium py-6 rounded-xl transition-colors duration-200 ${
              !item.available || !isRestaurantOpen()
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-red-700 hover:text-white text-foreground'
            }`}
            disabled={!item.available || !isRestaurantOpen()}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {!item.available 
              ? 'Not Available' 
              : !isRestaurantOpen() 
                ? 'Restaurant Closed' 
                : 'Add to Cart'
            }
          </Button>
        </CardFooter>
      </Card>

      <MenuItemDialog
        item={item}
        category={category}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddToCart={handleAddToCart}
        addons={addons}
        mealOptions={mealOptions}
        sauces={sauces}
        categorySauces={categorySauces}
      />
    </>
  );
} 
