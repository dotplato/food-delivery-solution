import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MenuGrid } from '@/components/menu/menu-grid';

export const metadata = {
  title: 'Menu | BurgerBliss',
  description: 'Browse our delicious menu of burgers, sides, and drinks',
};

export default function MenuPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Our Menu</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our delicious selection of burgers, sides, drinks, and combo meals. 
            Made with premium ingredients for maximum flavor.
          </p>
        </div>
        
        <Suspense fallback={<MenuSkeleton />}>
          <MenuGrid />
        </Suspense>
      </div>
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-10 w-48 mb-4" />
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