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
import { ShoppingBag, Bike, Loader2, MapPin, Pencil, Trash } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { PointsSection } from '@/components/checkout/points-section';

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

  // Redirect unauthenticated users
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      router.replace('/signin?redirect=/checkout');
    }
  }, [user, router]);

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
      // Prepare metadata with all cart items and their options
      const orderMetadata = pendingOrder.items.map(item => ({
        menu_item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        options: item.options || {
          selectedOption: null,
          selectedAddons: [],
          selectedMealOptions: [],
          selectedSauce: null
        }
      }));

      const orderPayload: any = {
        order_total: pendingOrder.order_total,
        delivery_address: pendingOrder.delivery_address,
        delivery_fee: pendingOrder.delivery_fee,
        phone: pendingOrder.phone,
        full_name: pendingOrder.full_name,
        payment_intent_id: null,
        payment_status: "cash_on_delivery",
        status: "pending",
        metadata: orderMetadata // Save all item details with options as JSON
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

      // Add points earned from the order
      if (orderData && user?.id) {
        const pointsEarned = Math.floor(pendingOrder.order_total * 10); // 10 points per $1
        if (pointsEarned > 0) {
          // Insert new transaction record for points earned
          const { error: insertError } = await supabase.from('royalty_points').insert({
            user_id: user.id,
            points_earned: pointsEarned,
            points_spent: 0
          });

          if (insertError) {
            console.error('Error adding points earned:', insertError);
          }
        }
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

  // Add a new handler for COD with points
  const handleCodOrderWithPoints = async (pointsToRedeem: number, pointsDiscount: number) => {
    if (!pendingOrder) return;
    setIsProcessingCod(true);

    try {
      // Prepare metadata with all cart items and their options
      const orderMetadata = pendingOrder.items.map(item => ({
        menu_item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        options: item.options || {
          selectedOption: null,
          selectedAddons: [],
          selectedMealOptions: [],
          selectedSauce: null
        }
      }));

      const orderPayload: any = {
        order_total: pendingOrder.order_total - pointsDiscount,
        delivery_address: pendingOrder.delivery_address,
        delivery_fee: pendingOrder.delivery_fee,
        phone: pendingOrder.phone,
        full_name: pendingOrder.full_name,
        payment_intent_id: null,
        payment_status: "cash_on_delivery",
        status: "pending",
        metadata: orderMetadata // Save all item details with options as JSON
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

      // Handle royalty points
      if (orderData) {
        console.log('Processing royalty points for order:', orderData.id);
        console.log('Points to redeem:', pointsToRedeem);
        console.log('Points discount:', pointsDiscount);
        
        // Deduct points if any were redeemed
        if (pointsToRedeem > 0 && user?.id) {
          console.log('Deducting points:', pointsToRedeem);
          
          // Insert new transaction record for points spent
          const { error: insertError } = await supabase.from('royalty_points').insert({
            user_id: user.id,
            points_earned: 0,
            points_spent: pointsToRedeem
          });

          if (insertError) {
            console.error('Error updating royalty points:', insertError);
          } else {
            console.log('Successfully deducted points');
          }
        }

        // Add points earned from the order (based on the actual amount paid)
        const pointsEarned = Math.floor((pendingOrder.order_total - pointsDiscount) * 10); // 10 points per $1
        console.log('Points to earn:', pointsEarned);
        console.log('Order total:', pendingOrder.order_total);
        console.log('Points discount:', pointsDiscount);
        
        if (pointsEarned > 0 && user?.id) {
          console.log('Adding points earned:', pointsEarned);
          
          // Insert new transaction record for points earned
          const { error: insertError } = await supabase.from('royalty_points').insert({
            user_id: user.id,
            points_earned: pointsEarned,
            points_spent: 0
          });

          if (insertError) {
            console.error('Error adding points earned:', insertError);
          } else {
            console.log('Successfully added points earned');
          }
        }
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
                  className="flex flex-col gap-4"
                >
                  <div
                    className={`
                      flex items-center gap-4 p-4 rounded-lg shadow-md border transition
                      cursor-pointer bg-white
                      ${orderType === 'delivery' ? 'border-gray-500' : 'border-gray-200 hover:border-gray-300'}
                    `}
                    onClick={() => setOrderType('delivery')}
                  >
                    <RadioGroupItem value="delivery" id="delivery" className="h-5 w-5" />
                    <span className="flex items-center gap-2">
                      {/* Delivery Icon */}
                      <Bike className="h-6 w-6 text-blue-500" />
                      <Label htmlFor="delivery" className="text-lg font-medium ">Delivery</Label>
                    </span>
                  </div>
                  <div
                    className={`
                      flex items-center gap-4 p-4 rounded-lg shadow-md border transition
                      cursor-pointer bg-white
                      ${orderType === 'pickup' ? 'border-gray-500' : 'border-gray-200 hover:border-gray-300'}
                    `}
                    onClick={() => setOrderType('pickup')}
                  >
                    <RadioGroupItem value="pickup" id="pickup" className="h-5 w-5" />
                    <span className="flex items-center gap-2">
                      {/* Pickup Icon */}
                      <ShoppingBag className="h-6 w-6 text-green-500" />
                      <Label htmlFor="pickup" className="text-lg font-medium">Pickup</Label>
                    </span>
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
                        <div className="flex items-center bg-gray-100 border rounded p-3 text-sm mt-2 gap-3 justify-between">
                          <div className="flex items-center gap-2">
                            {/* Lucide MapPin icon for address display */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s-6-5.686-6-10A6 6 0 0112 3a6 6 0 016 6c0 4.314-6 10-6 10z" />
                              <circle cx="12" cy="9" r="2.5" fill="currentColor" />
                            </svg>
                            <div>
                              {selectedLocation ? (
                                <>
                                  <b>Selected Address:</b> {selectedLocation.address}
                                </>
                              ) : (
                                <p>No address selected</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {selectedLocation ? (
                              <>
                                <button
                                  type="button"
                                  className="p-2 rounded hover:bg-blue-100 text-blue-600 transition"
                                  title="Edit address"
                                  onClick={() => setLocationDialogOpen(true)}
                                >
                                 <Pencil className='h-5 w-5' />
                                </button>
                                <button
                                  type="button"
                                  className="p-2 rounded hover:bg-red-100 text-red-600 transition"
                                  title="Delete address"
                                  onClick={() => setSelectedLocation(null)}
                                >
                                  {/* Trash icon */}
                                <Trash className='h-5 w-5' />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className="p-2 flex gap-2 rounded hover:bg-blue-100 text-blue-600 transition"
                                title="Select address"
                                onClick={() => setLocationDialogOpen(true)}
                              >
                                {/* Bike icon as a placeholder for select */}
                                <MapPin className="h-5 w-5" />
                                Select Address
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {addressError && <div className="text-red-600 text-sm mt-1">{addressError}</div>}
                    </>
                  )}
                  <Button
                    type="submit"
                    className="w-full mt-2"
                    
                  >
                    Continue to Payment
                  </Button>
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
                
                {/* Beautiful Points Section */}
                <div className="mb-6">
                  <PointsSection
                    userPoints={userPoints}
                    redeemPoints={redeemPoints}
                    pointsToRedeem={pointsToRedeem}
                    pointsDiscount={pointsDiscount}
                    total={total}
                    onRedeemChange={setRedeemPoints}
                  />
                </div>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="mb-6 flex flex-col gap-3"
                >
                  <div
                    className={`
                      flex items-center gap-4 p-4 rounded-lg shadow-md border transition
                      cursor-pointer bg-white
                      ${paymentMethod === 'card' ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 hover:border-gray-300'}
                    `}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <RadioGroupItem value="card" id="card" className="h-5 w-5" />
                    <span className="flex items-center gap-2">
                      {/* Card Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth={2} stroke="currentColor" fill="none"/>
                        <path d="M2 10h20" strokeWidth={2} stroke="currentColor" />
                      </svg>
                      <Label htmlFor="card" className="text-lg font-medium">Credit / Debit Card</Label>
                    </span>
                  </div>
                  <div
                    className={`
                      flex items-center gap-4 p-4 rounded-lg shadow-md border transition
                      cursor-pointer bg-white
                      ${paymentMethod === 'cod' ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 hover:border-gray-300'}
                    `}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <RadioGroupItem value="cod" id="cod" className="h-5 w-5" />
                    <span className="flex items-center gap-2">
                      {/* Cash Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="3" y="7" width="18" height="10" rx="2" strokeWidth={2} stroke="currentColor" fill="none"/>
                        <circle cx="12" cy="12" r="2.5" strokeWidth={2} stroke="currentColor" fill="none"/>
                      </svg>
                      <Label htmlFor="cod" className="text-lg font-medium">Cash on Delivery</Label>
                    </span>
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
                      onClick={() => redeemPoints && pointsToRedeem > 0 
                        ? handleCodOrderWithPoints(pointsToRedeem, pointsDiscount)
                        : handleCodOrder()
                      }
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
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="font-semibold text-green-700">Points Discount Applied</span>
                    </div>
                    <span className="text-lg font-bold text-green-700">-${pointsDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-green-200">
                    <span className="font-medium text-gray-700">Final Total</span>
                    <span className="text-xl font-bold text-gray-900">${(total - pointsDiscount).toFixed(2)}</span>
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