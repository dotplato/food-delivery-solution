'use client';

import { useState, useEffect, useRef } from 'react';
import { MenuItem } from './menu-item';
import type { MenuItem as MenuItemType, Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RestaurantStatus } from './restaurant-status';

export function MenuGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [mealOptions, setMealOptions] = useState<any[]>([]);
  const [sauces, setSauces] = useState<any[]>([]);
  const [categorySauces, setCategorySauces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [catRes, menuRes, addonsRes, mealOptionsRes, saucesRes, catSaucesRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('menu_items').select('*').eq('available', true).order('name'),
        supabase.from('addons').select('*').order('name'),
        supabase.from('meal_options').select('*').order('name'),
        supabase.from('sauces').select('*').order('name'),
        supabase.from('category_sauces').select('*'),
      ]);
      setCategories(catRes.data || []);
      setMenuItems(menuRes.data || []);
      setAddons(addonsRes.data || []);
      setMealOptions(mealOptionsRes.data || []);
      setSauces(saucesRes.data || []);
      setCategorySauces(catSaucesRes.data || []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  useEffect(() => {
    if (loading || categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = entry.target.getAttribute('data-category-id');
            if (categoryId) {
              setActiveCategory(categoryId);

              // Auto-scroll the active category button into view
              const activeButton = scrollContainerRef.current?.querySelector(
                `[data-category-btn="${categoryId}"]`
              );
              if (activeButton && scrollContainerRef.current) {
                const container = scrollContainerRef.current;
                const buttonRect = activeButton.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const scrollLeft =
                  container.scrollLeft +
                  (buttonRect.left - containerRect.left) -
                  containerRect.width / 2 +
                  buttonRect.width / 2;
                container.scrollTo({ left: scrollLeft, behavior: "smooth" });
              }
            }
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      }
    );

    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [loading, categories, menuItems]);

  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getItemsByCategory = (categoryId: string) =>
    menuItems.filter((item) => item.category_id === categoryId);

  if (loading) return <MenuSkeleton />;

  return (
    <div className="space-y-8">
      {/* Restaurant Status */}
      <div className="mb-6">
        <RestaurantStatus />
      </div>

      {/* CATEGORY BAR FIXED */}
      <div className="sticky top-20 z-10 bg-white/95 pt-10 backdrop-blur-sm border-b pb-4">
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing px-2 py-1 select-none"
          onMouseDown={(e) => {
  const container = e.currentTarget as HTMLDivElement & {
    isDown?: boolean;
    startX?: number;
    scrollLeftStart?: number;
  };
  container.isDown = true;
  container.startX = e.pageX - container.offsetLeft;
  container.scrollLeftStart = container.scrollLeft;
}}
onMouseLeave={(e) => {
  const container = e.currentTarget as HTMLDivElement & { isDown?: boolean };
  container.isDown = false;
}}
onMouseUp={(e) => {
  const container = e.currentTarget as HTMLDivElement & { isDown?: boolean };
  container.isDown = false;
}}
onMouseMove={(e) => {
  const container = e.currentTarget as HTMLDivElement & {
    isDown?: boolean;
    startX?: number;
    scrollLeftStart?: number;
  };
  if (!container.isDown) return;
  e.preventDefault();
  const x = e.pageX - container.offsetLeft;
  const walk = (x - (container.startX ?? 0)) * 1;
  container.scrollLeft = (container.scrollLeftStart ?? 0) - walk;
}}

        >
          {/* All Items */}
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

          {/* Categories */}
          {categories.map((category) => {
            const itemCount = getItemsByCategory(category.id).length;
            if (itemCount === 0) return null;

            return (
              <Button
                key={category.id}
                data-category-btn={category.id}
                variant="outline"
                size="sm"
                onClick={() => scrollToCategory(category.id)}
                className={cn(
                  "flex-shrink-0 rounded-full px-6 py-6 whitespace-nowrap transition-all",
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

      {/* MENU GRID */}
      <div className="space-y-12">
        {categories.map((category) => {
          const categoryItems = getItemsByCategory(category.id);
          if (categoryItems.length === 0) return null;

          return (
            <div
              key={category.id}
              ref={(el) => (categoryRefs.current[category.id] = el)}
              data-category-id={category.id}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h2>
                {category.description && (
                  <p className="text-gray-600">{category.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryItems.map((item) => {
                  const matchedCategory = categories.find(
                    (cat) => cat.id === item.category_id
                  );
                  return (
                    <MenuItem
                      key={item.id}
                      item={item}
                      category={matchedCategory}
                      addons={addons}
                      mealOptions={mealOptions}
                      sauces={sauces}
                      categorySauces={categorySauces}
                    />
                  );
                })}
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
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
