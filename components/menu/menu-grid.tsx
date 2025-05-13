'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Category, MenuItem } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { useCart } from '@/context/cart-context';
import { cn } from '@/lib/utils';

export function MenuGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;
        setCategories(data || []);

        // Set initial active category to the first one
        if (data && data.length > 0) {
          setActiveCategory(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('name');

        if (error) throw error;
        setMenuItems(data || []);
        setFilteredItems(data || []);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredItems(menuItems);
    } else if (activeCategory) {
      setFilteredItems(menuItems.filter(item => item.category_id === activeCategory));
    }
  }, [activeCategory, menuItems]);

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      quantity: 1,
    });
  };

  if (loading) {
    return <MenuSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue={categories[0]?.id || 'all'} onValueChange={setActiveCategory}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Menu Categories</h2>
          <TabsList className="flex flex-wrap gap-2 h-auto bg-transparent">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6"
            >
              All Items
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <MenuItem 
                key={item.id} 
                item={item} 
                onAddToCart={handleAddToCart} 
              />
            ))}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <MenuItem 
                  key={item.id} 
                  item={item} 
                  onAddToCart={handleAddToCart} 
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface MenuItemProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

function MenuItem({ item, onAddToCart }: MenuItemProps) {
  return (
    <div className="group bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            width={300}
            height={200}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No image</p>
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg">{item.name}</h3>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2 flex-grow">
          {item.description || 'Delicious meal made with premium ingredients'}
        </p>
        <div className="mt-4 flex justify-between items-center">
          <span className="font-semibold text-lg">${item.price.toFixed(2)}</span>
          <Button
            onClick={() => onAddToCart(item)}
            disabled={!item.available}
            variant="default"
            size="sm"
            className={cn(
              "bg-red-600 hover:bg-red-700",
              !item.available && "opacity-50 cursor-not-allowed"
            )}
          >
            {item.available ? 'Add to Cart' : 'Sold Out'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Menu Categories</h2>
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card border rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}