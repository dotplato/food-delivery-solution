'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { useCart } from '@/context/cart-context';
import { cn } from '@/lib/utils';

export function FeaturedMenu() {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('featured', true)
          .limit(4);

        if (error) throw error;
        setFeaturedItems(data || []);
      } catch (error) {
        console.error('Error fetching featured items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      quantity: 1,
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Featured Menu</h2>
          <p className="text-muted-foreground mt-2">Loading our customer favorites...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-xl h-80"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold">Featured Menu</h2>
        <p className="text-muted-foreground mt-2">Try our customer favorites</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {featuredItems.map((item) => (
          <FeaturedMenuItem 
            key={item.id} 
            item={item} 
            onAddToCart={handleAddToCart} 
          />
        ))}
      </motion.div>

      <div className="text-center mt-12">
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/menu" className="flex items-center">
            View Full Menu <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

interface FeaturedMenuItemProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

function FeaturedMenuItem({ item, onAddToCart }: FeaturedMenuItemProps) {
  return (
    <motion.div
      variants={item}
      className="group bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 h-10">
          {item.description || 'Delicious burger made with premium ingredients'}
        </p>
        <div className="mt-3 flex justify-between items-center">
          <span className="font-semibold text-lg">${item.price.toFixed(2)}</span>
          <Button
            onClick={() => onAddToCart(item)}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  );
}