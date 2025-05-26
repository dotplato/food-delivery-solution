'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { MenuItem, MenuItemOption, MenuItemAddon, MealOption } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MenuItemDialogProps {
  item: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (options: {
    selectedOption?: MenuItemOption;
    selectedAddons: MenuItemAddon[];
    selectedMealOptions?: MealOption[];
  }) => void;
}

export function MenuItemDialog({ item, open, onOpenChange, onAddToCart }: MenuItemDialogProps) {
  const [selectedOption, setSelectedOption] = useState<MenuItemOption | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [selectedMealOptions, setSelectedMealOptions] = useState<MealOption[]>([]);

  const handleAddonChange = (addon: MenuItemAddon, checked: boolean) => {
    if (checked) {
      setSelectedAddons([...selectedAddons, addon]);
    } else {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    }
  };

  const handleMealOptionChange = (option: MealOption, checked: boolean) => {
    if (checked) {
      setSelectedMealOptions([...selectedMealOptions, option]);
    } else {
      setSelectedMealOptions(selectedMealOptions.filter(o => o.id !== option.id));
    }
  };

  const calculateTotal = () => {
    let total = item.price;
    
    if (selectedOption) {
      total += selectedOption.price_adjustment;
    }
    
    selectedAddons.forEach(addon => {
      total += addon.price_adjustment;
    });
    
    selectedMealOptions.forEach(option => {
      total += option.price_adjustment;
    });
    
    return total;
  };

  const handleAddToCart = () => {
    onAddToCart({
      selectedOption: selectedOption || undefined,
      selectedAddons,
      selectedMealOptions: selectedMealOptions.length > 0 ? selectedMealOptions : undefined,
    });
    onOpenChange(false);
  };

  const requiredOptions = item.options?.filter(opt => opt.is_required) || [];
  const optionalAddons = item.addons?.filter(addon => !addon.is_required) || [];
  const requiredAddons = item.addons?.filter(addon => addon.is_required) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-64 rounded-lg overflow-hidden">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No image</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <p className="text-muted-foreground">{item.description}</p>

            {/* Required Options */}
            {requiredOptions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Required Options</h3>
                <RadioGroup
                  value={selectedOption?.id}
                  onValueChange={(value) => {
                    const option = requiredOptions.find(opt => opt.id === value);
                    setSelectedOption(option || null);
                  }}
                  className="space-y-2"
                >
                  {requiredOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-grow">
                        <div className="flex justify-between">
                          <span>{option.name}</span>
                          {option.price_adjustment > 0 && (
                            <span className="text-muted-foreground">
                              +${option.price_adjustment.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {option.description && (
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Required Addons (Sauces) */}
            {requiredAddons.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Required Addons</h3>
                <div className="space-y-2">
                  {requiredAddons.map((addon) => (
                    <div key={addon.id} className="flex items-center space-x-2">
                      <RadioGroup
                        value={selectedAddons.find(a => a.id === addon.id)?.id}
                        onValueChange={(value) => handleAddonChange(addon, value === addon.id)}
                      >
                        <RadioGroupItem value={addon.id} id={addon.id} />
                      </RadioGroup>
                      <Label htmlFor={addon.id} className="flex-grow">
                        <div className="flex justify-between">
                          <span>{addon.name}</span>
                          {addon.price_adjustment > 0 && (
                            <span className="text-muted-foreground">
                              +${addon.price_adjustment.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {addon.description && (
                          <p className="text-sm text-muted-foreground">{addon.description}</p>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Addons */}
            {optionalAddons.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Optional Addons</h3>
                <div className="space-y-2">
                  {optionalAddons.map((addon) => (
                    <div key={addon.id} className="flex items-center space-x-2">
                      <RadioGroup
                        value={selectedAddons.find(a => a.id === addon.id)?.id}
                        onValueChange={(value) => handleAddonChange(addon, value === addon.id)}
                      >
                        <RadioGroupItem value={addon.id} id={addon.id} />
                      </RadioGroup>
                      <Label htmlFor={addon.id} className="flex-grow">
                        <div className="flex justify-between">
                          <span>{addon.name}</span>
                          {addon.price_adjustment > 0 && (
                            <span className="text-muted-foreground">
                              +${addon.price_adjustment.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {addon.description && (
                          <p className="text-sm text-muted-foreground">{addon.description}</p>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meal Options (shown only when "Make it a Meal" is selected) */}
            {selectedOption?.name === 'Make it a Meal' && item.meal_options && item.meal_options.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Meal Options</h3>
                <div className="space-y-2">
                  {item.meal_options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroup
                        value={selectedMealOptions.find(o => o.id === option.id)?.id}
                        onValueChange={(value) => handleMealOptionChange(option, value === option.id)}
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                      </RadioGroup>
                      <Label htmlFor={option.id} className="flex-grow">
                        <div className="flex justify-between">
                          <span>{option.name}</span>
                          {option.price_adjustment > 0 && (
                            <span className="text-muted-foreground">
                              +${option.price_adjustment.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {option.description && (
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
              </div>
              <Button
                onClick={handleAddToCart}
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={
                  (requiredOptions.length > 0 && !selectedOption) ||
                  (requiredAddons.length > 0 && selectedAddons.length === 0)
                }
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 