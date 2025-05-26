'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { MenuItem as MenuItemType, MenuItemOption, MenuItemAddon, MealOption } from '@/lib/types';
import { useCart } from '@/context/cart-context';
import { MenuItemDialog } from './menu-item-dialog';

interface MenuItemProps {
  item: MenuItemType;
}

export function MenuItem({ item }: MenuItemProps) {
  const { addToCart } = useCart();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddToCart = (selectedOptions: {
    selectedOption?: MenuItemOption;
    selectedAddons: MenuItemAddon[];
    selectedMealOptions?: MealOption[];
  }) => {
    // Calculate total price including options
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
      price: totalPrice,
      quantity: 1,
      options: selectedOptions
    });
  };

  return (
    <>
      <Card className="overflow-hidden">
        {item.image_url && (
          <div className="relative h-48 w-full">
            <img
              src={item.image_url}
              alt={item.name}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          <p className="text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={() => setDialogOpen(true)}
            className="w-full"
            disabled={!item.available}
          >
            {item.available ? 'Add to Cart' : 'Not Available'}
          </Button>
        </CardFooter>
      </Card>

      <MenuItemDialog
        item={item}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddToCart={handleAddToCart}
      />
    </>
  );
} 