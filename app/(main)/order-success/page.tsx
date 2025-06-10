import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Order Success | BurgerBliss',
  description: 'Your order has been successfully placed',
};

export default function OrderSuccessPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-14 w-14 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Order Successful!</h1>
        
        <p className="text-muted-foreground mb-8">
          Thank you for your order. Your delicious meal is being prepared and will be on its way shortly.
        </p>
        
        <div className="mb-8">
          <Image
            src="https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg"
            alt="Delicious burger being prepared"
            width={400}
            height={300}
            className="rounded-lg mx-auto"
            unoptimized
          />
        </div>
        
        <div className="space-y-4">
          <Button className="w-full" asChild>
            <Link href="/orders">
              View Your Orders
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}