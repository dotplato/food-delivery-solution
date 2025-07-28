import { Suspense } from 'react';
import Loader from '@/components/ui/loader';
import { MenuGrid } from '@/components/menu/menu-grid';
import { CartPreview } from '@/components/menu/cart-preview';

export const metadata = {
  title: 'Menu | BurgerBliss',
  description: 'Browse our delicious menu of burgers, sides, and drinks',
};

export default function MenuPage() {
  return (
    <div className="pt-32 pb-16">
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Our Menu</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our delicious selection of burgers, sides, drinks, and combo meals. 
            Made with premium ingredients for maximum flavor.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu Content */}
          <div className="lg:col-span-3">
            <Suspense fallback={<Loader />}>
              <MenuGrid />
            </Suspense>
          </div>
          
          {/* Cart Preview */}
          <div className="lg:col-span-1">
            <Suspense fallback={<Loader />}>
            <CartPreview />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}