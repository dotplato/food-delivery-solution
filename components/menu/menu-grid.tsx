'use client';

import { useState, useEffect, useRef } from 'react';
import { MenuItem } from './menu-item';
import type { MenuItem as MenuItemType, Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function MenuGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  // Intersection Observer to track which category is currently visible
  useEffect(() => {
    if (loading || categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = entry.target.getAttribute('data-category-id');
            if (categoryId) {
              setActiveCategory(categoryId);
            }
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px', // Adjust these values to control when a category is considered "active"
        threshold: 0
      }
    );

    // Observe all category sections
    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => observer.disconnect();
  }, [loading, categories, menuItems]);

  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  const getItemsByCategory = (categoryId: string) => {
    return menuItems.filter(item => item.category_id === categoryId);
  };

  if (loading) {
    return <MenuSkeleton />;
  }

  return (
    <div className="space-y-8 ">
      {/* Category Navigation */}
      <div className="sticky top-20 z-10 bg-white/95 pt-10 backdrop-blur-sm border-b pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveCategory(null);
            }}
            className={cn(
              "flex-shrink-0 rounded-full px-6 py-6",
              activeCategory === null 
                ? "bg-red-700 text-white border-red-700 hover:bg-red-800" 
                : "border-gray-300 text-gray-900 hover:bg-gray-50"
            )}
          >
            All Items
          </Button>
          {categories.map(category => {
            const itemCount = getItemsByCategory(category.id).length;
            if (itemCount === 0) return null;
            
            return (
              <Button
                key={category.id}
                variant="outline"
                size="sm"
                onClick={() => scrollToCategory(category.id)}
                className={cn(
                  "flex-shrink-0 rounded-full px-6 py-6",
                  activeCategory === category.id 
                    ? "bg-red-700 text-white border-red-700 hover:bg-red-800" 
                    : "border-gray-300 text-gray-900 hover:bg-gray-50"
                )}
              >
                {category.name}
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-2 text-xs",
                    activeCategory === category.id 
                      ? "bg-white/20 text-white" 
                      : "bg-gray-100 text-gray-700"
                  )}
                >
                  {itemCount}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Menu Items by Category */}
      <div className="space-y-12">
        {categories.map(category => {
          const categoryItems = getItemsByCategory(category.id);
          if (categoryItems.length === 0) return null;

          return (
            <div 
            
              key={category.id} 
              ref={el => categoryRefs.current[category.id] = el}
              data-category-id={category.id}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-gray-600">{category.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryItems.map(item => (
                  <MenuItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          );
        })}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-40 w-full" />
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}