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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LocationDialog } from '@/components/location/LocationDialog';
import { useRef } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type OrderType = 'delivery' | 'pickup';

export default function CheckoutPage() {
  const [step, setStep] = useState<'type' | 'address' | 'payment'>('type');
  const [orderType, setOrderType] = useState<OrderType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('order_type') as OrderType) || 'delivery';
    }
    return 'delivery';
  });
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const { items, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [addressError, setAddressError] = useState('');

  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Redirect if no items in cart
  if (typeof window !== 'undefined' && items.length === 0) {
    router.push('/cart');
  }

  const deliveryFee = 3.99;
  const total = orderType === 'delivery' ? subtotal + deliveryFee : subtotal;

  const handleOrderTypeSubmit = () => {
    if (orderType === 'pickup') {
      setPendingOrder({
        items,
        order_type: 'pickup',
        subtotal,
        delivery_fee: 0,
        total: subtotal,
      });
      setStep('payment');
    } else {
      setLocationDialogOpen(true);
      setStep('address');
    }
  };

  const handleLocationSelect = (loc: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(loc);
    setLocationDialogOpen(false);
    setAddressError('');
  };

  const handleAddressFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) {
      setAddressError('Please select a delivery address.');
      return;
    }
    if (!fullName || !phone) {
      setAddressError('Full Name and Phone are required.');
      return;
    }
    setPendingOrder({
      items,
      order_type: 'delivery',
      delivery_address: selectedLocation.address,
      location: { lat: selectedLocation.lat, lng: selectedLocation.lng },
      phone,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      message,
      full_name: fullName,
    } as any); // 'as any' to allow extra fields for now
    setStep('payment');
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'type' && (
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Select Order Type</h2>
                <Separator className="mb-6" />
                <RadioGroup
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as OrderType)}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery">Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup">Pickup</Label>
                  </div>
                </RadioGroup>
                <Button 
                  className="mt-6 w-full"
                  onClick={handleOrderTypeSubmit}
                >
                  Continue
                </Button>
              </div>
            )}
            
            {step === 'address' && orderType === 'delivery' && (
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
                <Separator className="mb-6" />
                <form onSubmit={handleAddressFormSubmit} className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded border border-gray-300"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 rounded border border-gray-300"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Message (Optional)</label>
                    <textarea
                      className="w-full px-3 py-2 rounded border border-gray-300"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
                      onClick={() => setLocationDialogOpen(true)}
                    >
                      {selectedLocation ? 'Change Address' : 'Select Address'}
                    </button>
                  </div>
                  {selectedLocation && (
                    <div className="bg-gray-100 border rounded p-3 text-sm">
                      <div><b>Selected Address:</b> {selectedLocation.address}</div>
                    </div>
                  )}
                  {addressError && <div className="text-red-600 text-sm">{addressError}</div>}
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg mt-2 transition"
                  >
                    Continue to Payment
                  </button>
                </form>
                <LocationDialog
                  open={locationDialogOpen}
                  onClose={() => setLocationDialogOpen(false)}
                  onSelect={handleLocationSelect}
                />
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