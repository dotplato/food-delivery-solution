'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { AddressForm } from '@/components/checkout/address-form';
import { PaymentForm } from '@/components/checkout/payment-form';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { PendingOrder } from '@/lib/types';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const { items, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Redirect if no items in cart
  if (typeof window !== 'undefined' && items.length === 0) {
    router.push('/cart');
  }

  const deliveryFee = 3.99;
  const total = subtotal + deliveryFee;

  const handleAddressSubmit = (addressData: { fullName: string; phone: string; address: string }) => {
    setPendingOrder({
      items,
      delivery_address: addressData.address,
      phone: addressData.phone,
      subtotal,
      delivery_fee: deliveryFee,
      total,
    });
    setStep('payment');
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'address' && (
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
                <Separator className="mb-6" />
                <AddressForm onSubmit={handleAddressSubmit} />
              </div>
            )}
            
            {step === 'payment' && pendingOrder && (
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Payment</h2>
                <Separator className="mb-6" />
                <Elements stripe={stripePromise}>
                  <PaymentForm pendingOrder={pendingOrder} />
                </Elements>
              </div>
            )}
          </div>
          
          <div>
            <div className="bg-card border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <Separator className="mb-4" />
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeItem={removeFromCart}
                  />
                ))}
              </div>
            </div>
            
            <CartSummary showCheckoutButton={false} />
          </div>
        </div>
      </div>
    </div>
  );
}