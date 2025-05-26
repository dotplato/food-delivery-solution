'use client';

import { useState, useEffect } from 'react';
import { MenuItem } from './menu-item';
import type { MenuItem as MenuItemType, Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function MenuGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    }

    async function fetchMenuItems() {
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          options:menu_item_options(*),
          addons:menu_item_addons(*),
          meal_options:meal_options(*)
        `)
        .eq('available', true)
        .order('name');

      if (menuItemsError) {
        console.error('Error fetching menu items:', menuItemsError);
        return;
      }

      // Ensure the data matches the expected types
      const typedMenuItems = (menuItemsData || []).map(item => ({
        ...item,
        options: item.options || [],
        addons: item.addons || [],
        meal_options: item.meal_options || []
      }));

      setMenuItems(typedMenuItems);
      setLoading(false);
    }

    fetchCategories();
    fetchMenuItems();
  }, []);

  const filteredItems = selectedCategory
    ? menuItems.filter(item => item.category_id === selectedCategory)
    : menuItems;

  if (loading) {
    return <MenuSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div className="space-y-8">
      {/* Categories Skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>

      {/* Menu Items Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-6 w-1/4 mt-2" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}