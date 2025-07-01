'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
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
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type OrderType = 'delivery' | 'pickup';
type PaymentMethod = 'card' | 'cod';

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
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [addressError, setAddressError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessingCod, setIsProcessingCod] = useState(false);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);

  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Redirect if no items in cart
  useEffect(() => {
    if (typeof window !== 'undefined' && items.length === 0 && step !== 'type') {
      router.push('/cart');
    }
  }, [items, router, step]);

  const deliveryFee = 3.99;
  const total = orderType === 'delivery' ? subtotal + deliveryFee : subtotal;

  useEffect(() => {
    async function fetchProfile() {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', user.id)
          .single();
        if (data) {
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
        }
      }
    }
    fetchProfile();
  }, [user]);

  // Fetch user points when entering payment step
  useEffect(() => {
    const fetchPoints = async () => {
      if (user?.id && step === 'payment') {
        const { data, error } = await supabase
          .from('royalty_points')
          .select('current_balance')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (!error && data) {
          setUserPoints(data.current_balance || 0);
        } else {
          setUserPoints(0);
        }
      }
    };
    fetchPoints();
  }, [user, step]);

  // Calculate points to redeem and discount
  useEffect(() => {
    if (redeemPoints && userPoints > 0 && pendingOrder) {
      // 100 points = $1 off, up to order total
      const maxPoints = Math.min(userPoints, Math.floor(pendingOrder.order_total * 100));
      setPointsToRedeem(maxPoints);
      setPointsDiscount(maxPoints / 100);
    } else {
      setPointsToRedeem(0);
      setPointsDiscount(0);
    }
  }, [redeemPoints, userPoints, pendingOrder]);

  const handleOrderTypeSubmit = () => {
    setStep('address');
  };

  const handleLocationSelect = (loc: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(loc);
    setLocationDialogOpen(false);
    setAddressError('');
  };

  const handleAddressFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderType === 'delivery') {
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
        order_total: subtotal + deliveryFee,
        message,
        full_name: fullName,
      } as any);
    } else {
      // Pickup: only require name/phone
      if (!fullName || !phone) {
        setAddressError('Full Name and Phone are required.');
        return;
      }
      setPendingOrder({
        items,
        order_type: 'pickup',
        phone,
        subtotal,
        delivery_fee: 0,
        order_total: subtotal,
        message,
        full_name: fullName,
      } as any);
    }
    setAddressError('');
    setStep('payment');
  };

  const handleCodOrder = async () => {
    if (!pendingOrder) return;
    setIsProcessingCod(true);

    try {
      const orderPayload: any = {
        order_total: pendingOrder.order_total,
        delivery_address: pendingOrder.delivery_address,
        delivery_fee: pendingOrder.delivery_fee,
        phone: pendingOrder.phone,
        full_name: pendingOrder.full_name,
        payment_intent_id: null,
        payment_status: "cash_on_delivery",
        status: "pending",
      };

      if (user?.id) {
        orderPayload.user_id = user.id;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = pendingOrder.items.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success("Order placed successfully!");
      clearCart();
      router.push("/order-success");
    } catch (error: any) {
      toast.error("Failed to create order. Please try again.");
      console.error("COD Order Error:", error);
    } finally {
      setIsProcessingCod(false);
    }
  };

  // Add a new handler for COD with points
  const handleCodOrderWithPoints = async (pointsToRedeem: number, pointsDiscount: number) => {
    if (!pendingOrder) return;
    setIsProcessingCod(true);

    try {
      const orderPayload: any = {
        order_total: pendingOrder.order_total - pointsDiscount,
        delivery_address: pendingOrder.delivery_address,
        delivery_fee: pendingOrder.delivery_fee,
        phone: pendingOrder.phone,
        full_name: pendingOrder.full_name,
        payment_intent_id: null,
        payment_status: "cash_on_delivery",
        status: "pending",
      };

      if (user?.id) {
        orderPayload.user_id = user.id;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = pendingOrder.items.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Deduct points spent if any
      if (pointsToRedeem > 0 && user?.id) {
        await supabase.from('royalty_points').insert({
          user_id: user.id,
          points_earned: 0,
          points_spent: pointsToRedeem,
        });
      }

      toast.success("Order placed successfully!");
      clearCart();
      router.push("/order-success");
    } catch (error: any) {
      toast.error("Failed to create order. Please try again.");
      console.error("COD Order Error:", error);
    } finally {
      setIsProcessingCod(false);
    }
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
            
            {step === 'address' && (
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">{orderType === 'delivery' ? 'Delivery Information' : 'Pickup Information'}</h2>
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
                  {orderType === 'delivery' && (
                    <>
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
                    </>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg mt-2 transition"
                  >
                    Continue to Payment
                  </button>
                </form>
                {orderType === 'delivery' && (
                  <LocationDialog
                    open={locationDialogOpen}
                    onClose={() => setLocationDialogOpen(false)}
                    onSelect={handleLocationSelect}
                  />
                )}
              </div>
            )}
            
            {step === 'payment' && pendingOrder && (
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Payment</h2>
                <Separator className="mb-6" />
                {/* Redeem Points Option */}
                {userPoints > 0 && (
                  <div className="mb-4 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="redeem-points"
                      checked={redeemPoints}
                      onChange={e => setRedeemPoints(e.target.checked)}
                    />
                    <label htmlFor="redeem-points" className="cursor-pointer">
                      Redeem points ({userPoints} points available — ${(userPoints / 100).toFixed(2)} off)
                    </label>
                  </div>
                )}
                {/* Show discount if redeeming */}
                {redeemPoints && pointsDiscount > 0 && (
                  <div className="mb-4 text-green-700 font-semibold">
                    Applying {pointsToRedeem} points for ${pointsDiscount.toFixed(2)} off
                  </div>
                )}
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="mb-6 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Credit / Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod">Cash on Delivery</Label>
                  </div>
                </RadioGroup>

                <Separator className="mb-6" />

                {paymentMethod === "card" ? (
                  <Elements stripe={stripePromise}>
                    <PaymentForm pendingOrder={{...pendingOrder, pointsToRedeem, pointsDiscount}} />
                  </Elements>
                ) : (
                  <div>
                    <p className="text-muted-foreground mb-4">
                      You will pay in cash upon delivery.
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => handleCodOrderWithPoints(pointsToRedeem, pointsDiscount)}
                      disabled={isProcessingCod}
                    >
                      {isProcessingCod ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Confirm Order
                    </Button>
                  </div>
                )}
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
              {/* Points Discount and Updated Total */}
              {redeemPoints && pointsDiscount > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Points Discount</span>
                    <span>- ${pointsDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2">
                    <span>Total after Discount</span>
                    <span>${(total - pointsDiscount).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <CartSummary showCheckoutButton={false} pointsDiscount={redeemPoints ? pointsDiscount : 0} />
          </div>
        </div>
      </div>
    </div>
  );
}