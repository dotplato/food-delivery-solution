import { Suspense } from "react";
import Loader from "@/components/ui/loader";
import { MenuGrid } from "@/components/menu/menu-grid";
import { CartPreview } from "@/components/menu/cart-preview";
import { fetchMenuData } from "@/lib/fetch/menu-data";

export const metadata = {
  title: "Menu | Bunhub Burgers",
  description: "Browse our delicious menu of burgers, sides, and drinks",
};

export const revalidate = 60; // Cache for 1 minute (ISR)

export default async function MenuPage() {
  const data = await fetchMenuData();

  return (
    <div className="pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10  px-4 py-8 rounded-xl shadow-lg">
          <h1 className="text-4xl font-bold mb-4">Our Menu</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our delicious selection of burgers, sides, drinks, and combo
            meals. Made with premium ingredients for maximum flavor.
          </p>
          <div className="flex flex-col md:flex-row  justify-center gap-4 mt-6">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 text-gray-700 text-base">
                {/* Location Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 10c-4.418 0-8-5.373-8-10a8 8 0 1116 0c0 4.627-3.582 10-8 10z"
                  />
                </svg>
                <span>
                  10 Stephenson Place, Chesterfield, Chesterfield, S40 1XL
                </span>
              </div>
              <span className="text-gray-500 text-sm mt-1 ml-7 ">
                01246 461825
              </span>
            </div>
            <div className="flex items-start gap-2 text-gray-700 text-base">
              {/* Star Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
              </svg>
              <span>4.3&nbsp;</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu Content */}
          <div className="lg:col-span-3">
            <Suspense fallback={<Loader />}>
              <MenuGrid
                initialCategories={data.categories}
                initialMenuItems={data.menuItems}
                initialAddons={data.addons}
                initialMealOptions={data.mealOptions}
                initialSauces={data.sauces}
                initialCategorySauces={data.categorySauces}
              />
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
