import { HeroSlider } from '@/components/home/hero-slider';
import { CategoryCarousel } from '@/components/home/category-carousel';
import { DownloadAppSection } from '@/components/home/DownloadAppSection';
import Image from 'next/image';

export default function Home() {
  return (
    <div>
      <HeroSlider />
      
      <div className="container mx-auto px-4">
        <section className="py-12 md:py-20">
          <div className="overflow-x-auto max-w-full">
            <CategoryCarousel />
          </div>
        </section>
            {/* Features Section */}
            <section className="py-12 md:py-20 mb-28">
          <div className="flex items-center justify-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl hover:shadow-lg p-8 flex flex-col items-center text-center">
              <Image src="/images/icon1.svg" alt="Pick a Dish" width={150} height={150} className="mb-4" />
              <h3 className="font-bold text-3xl mb-2 py-4">Pick a Dish</h3>
              <p className="text-gray-600 text-sm">Browse our menu and choose from a variety of delicious dishes to satisfy your cravings.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white rounded-2xl  hover:shadow-lg p-8 flex flex-col items-center text-center">
              <Image src="/images/icon2.svg" alt="Make a Payment"  width={150} height={150}  className="mb-4" />
              <h3 className="font-bold text-3xl mb-2 py-4">Make a Payment</h3>
              <p className="text-gray-600 text-sm">Pay quickly and securely using your preferred payment method—online or on delivery.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white rounded-2xl  hover:shadow-lg p-8 flex flex-col items-center text-center">
              <Image src="/images/icon3.svg" alt="Receive your food" width={150} height={150} className="mb-4" />
              <h3 className="font-bold text-3xl mb-2 py-4">Receive your food</h3>
              <p className="text-gray-600 text-sm">Sit back and relax while we prepare and deliver your food hot and fresh to your door.</p>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-20">
          <DownloadAppSection/>
        </section>
    
      </div>
    </div>
  );
}

