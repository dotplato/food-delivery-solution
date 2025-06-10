'use client';

import { useState, useCallback } from 'react';
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
import { GoogleMap, LoadScript, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type OrderType = 'delivery' | 'pickup';

const RESTAURANT_LOCATION = {
  lat: 37.7749, // Replace with your restaurant's latitude
  lng: -122.4194 // Replace with your restaurant's longitude
};

const mapContainerStyle = {
  width: '100%',
  height: '300px'
};

const libraries: ("places" | "geometry")[] = ['places', 'geometry'];

export default function CheckoutPage() {
  const [step, setStep] = useState<'type' | 'address' | 'payment'>('type');
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLng | null>(null);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const { items, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries
  });

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setSelectedLocation(e.latLng);
    }
  }, []);

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
      // For pickup, skip address step and go directly to payment
      setPendingOrder({
        items,
        order_type: 'pickup',
        subtotal,
        delivery_fee: 0,
        total: subtotal,
      });
      setStep('payment');
    } else {
      setStep('address');
    }
  };

  const handleAddressSubmit = (addressData: { fullName: string; phone: string; address: string }) => {
    if (!selectedLocation) {
      toast.error('Please select a delivery location on the map');
      return;
    }

    // Verify delivery location (you can add your own logic here)
    const isDeliveryAvailable = verifyDeliveryLocation(selectedLocation);
    
    if (!isDeliveryAvailable) {
      toast.error('Sorry, delivery is not available to this location');
      return;
    }

    setPendingOrder({
      items,
      order_type: 'delivery',
      delivery_address: addressData.address,
      phone: addressData.phone,
      location: {
        lat: selectedLocation.lat(),
        lng: selectedLocation.lng()
      },
      subtotal,
      delivery_fee: deliveryFee,
      total,
    });
    setStep('payment');
  };

  const verifyDeliveryLocation = (location: google.maps.LatLng): boolean => {
    const restaurantLocation = new google.maps.LatLng(
      RESTAURANT_LOCATION.lat,
      RESTAURANT_LOCATION.lng
    );
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      location,
      restaurantLocation
    );
    
    // Convert distance to miles (1 meter = 0.000621371 miles)
    const distanceInMiles = distance * 0.000621371;
    
    return distanceInMiles <= 5; // 5 miles radius
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

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
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Select Delivery Location</h3>
                  <div className="h-[300px] w-full mb-4">
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={RESTAURANT_LOCATION}
                        zoom={13}
                        onClick={onMapClick}
                      >
                        {selectedLocation && <Marker position={selectedLocation} />}
                        <Marker 
                          position={RESTAURANT_LOCATION}
                          icon={{
                            url: '/restaurant-marker.png',
                            scaledSize: new window.google.maps.Size(32, 32)
                          }}
                        />
                      </GoogleMap>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        Loading map...
                      </div>
                    )}
                  </div>
                </div>
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