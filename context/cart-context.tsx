'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '@/lib/types';
import { toast } from 'sonner';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
}

const defaultCartContext: CartContextType = {
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  subtotal: 0,
  totalItems: 0,
};

const CartContext = createContext<CartContextType>(defaultCartContext);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Calculate total number of items
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Load cart from localStorage when component mounts
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing stored cart:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  // Add item to cart
  const addToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === newItem.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
        toast.success(`${newItem.name} quantity updated in cart`);
        return updatedItems;
      } else {
        // Add new item
        toast.success(`${newItem.name} added to cart`);
        return [...prev, newItem];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => {
      const itemToRemove = prev.find(item => item.id === itemId);
      if (itemToRemove) {
        toast.success(`${itemToRemove.name} removed from cart`);
      }
      return prev.filter((item) => item.id !== itemId);
    });
  };

  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};