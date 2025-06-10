import { Suspense } from 'react';
import { HeroSlider } from '@/components/home/hero-slider';
import { FeaturedMenu } from '@/components/home/featured-menu';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  return (
    <div>
      <HeroSlider />
      
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Welcome to BurgerBliss</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Indulge in our mouthwatering burgers made with quality ingredients and served with 
            love. From classic beef to innovative plant-based options, there's something for everyone.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Ingredients</h3>
              <p className="text-muted-foreground">
                We use only the freshest, highest-quality ingredients to ensure every bite is delicious.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Our efficient delivery system ensures your food arrives hot and fresh at your doorstep.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer Satisfaction</h3>
              <p className="text-muted-foreground">
                We're committed to providing an exceptional dining experience with every order.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="bg-muted py-12">
        <Suspense fallback={<FeaturedMenuSkeleton />}>
          <FeaturedMenu />
        </Suspense>
      </section>
      
      <section className="py-16 bg-[url('https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg')] bg-cover bg-center">
        <div className="bg-black/70 py-16">
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Browse our menu and have your favorite burgers delivered right to your doorstep!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/menu" className="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-colors">
                Order Now
              </a>
              <a href="/contact" className="bg-transparent border border-white text-white px-8 py-3 rounded-full hover:bg-white/10 transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeaturedMenuSkeleton() {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-10">
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl overflow-hidden shadow-sm">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}