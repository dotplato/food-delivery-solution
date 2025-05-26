'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MenuItem, MenuItemOption, MenuItemAddon, MealOption } from '@/lib/types';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  available: boolean;
  featured: boolean;
  created_at: string;
  quantity: number;
  options?: {
    selectedOption?: MenuItemOption;
    selectedAddons: MenuItemAddon[];
    selectedMealOptions?: MealOption[];
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(items));
    
    // Calculate total
    const newTotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    setTotal(newTotal);
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems(currentItems => {
      // Check if item with same options already exists
      const existingItemIndex = currentItems.findIndex(
        currentItem => 
          currentItem.id === item.id && 
          JSON.stringify(currentItem.options) === JSON.stringify(item.options)
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const newItems = [...currentItems];
        newItems[existingItemIndex].quantity += item.quantity;
        toast.success(`${item.name} quantity updated in cart`);
        return newItems;
      } else {
        // Add new item with default options if none provided
        const newItem = {
          ...item,
          options: item.options || {
            selectedAddons: []
          }
        };
        toast.success(`${item.name} added to cart`);
        return [...currentItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(currentItems => {
      const itemToRemove = currentItems.find(item => item.id === itemId);
      if (itemToRemove) {
        toast.success(`${itemToRemove.name} removed from cart`);
      }
      return currentItems.filter((item) => item.id !== itemId);
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.success('Cart cleared');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}