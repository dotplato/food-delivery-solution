'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
}

const slides: Slide[] = [
  {
    image: '/images/1.png',
    title: 'Juicy Burgers',
    subtitle: 'Made with premium ingredients for maximum flavor',
    cta: 'Order Now',
    ctaLink: '/menu',
  },
  {
    image: '/images/2.png',
    title: 'Try Our New Specials',
    subtitle: 'Limited time offerings with unique flavor combinations',
    cta: 'See Specials',
    ctaLink: '/menu',
  },
  {
    image: 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg',
    title: 'Complete Your Meal',
    subtitle: 'Delicious sides and shakes to complement your burger',
    cta: 'View Menu',
    ctaLink: '/menu',
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen max-h-[800px] w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            'absolute inset-0 transition-all duration-1000 ease-in-out',
            current === index 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-full'
          )}
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
            <div className="max-w-3xl">
              <h1 
                className={cn(
                  "text-4xl md:text-6xl font-bold mb-4 opacity-0 transition-all duration-700 delay-300",
                  current === index && "opacity-100 translate-y-0"
                )}
                style={{ transform: current === index ? 'translateY(0)' : 'translateY(20px)' }}
              >
                {slide.title}
              </h1>
              <p 
                className={cn(
                  "text-xl mb-8 opacity-0 transition-all duration-700 delay-500",
                  current === index && "opacity-100 translate-y-0"
                )}
                style={{ transform: current === index ? 'translateY(0)' : 'translateY(20px)' }}
              >
                {slide.subtitle}
              </p>
              <Button 
                asChild
                size="lg" 
                className={cn(
                  "opacity-0 transition-all duration-700 delay-700 bg-red-600 hover:bg-red-700 rounded-full px-8 py-6 text-lg",
                  current === index && "opacity-100 translate-y-0"
                )}
                style={{ transform: current === index ? 'translateY(0)' : 'translateY(20px)' }}
              >
                <Link href={slide.ctaLink}>
                  {slide.cta}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 z-10 rounded-full w-12 h-12"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 z-10 rounded-full w-12 h-12"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      
      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              current === index ? "bg-white w-10" : "bg-white/50"
            )}
            onClick={() => {
              if (isAnimating) return;
              setIsAnimating(true);
              setCurrent(index);
              setTimeout(() => setIsAnimating(false), 500);
            }}
          />
        ))}
      </div>
    </div>
  );
}