'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { PendingOrder } from '@/lib/types';

interface PaymentFormProps {
  pendingOrder: PendingOrder & {
    pointsDiscount?: number;
    pointsToRedeem?: number;
  };
}

export function PaymentForm({ pendingOrder }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { clearCart } = useCart();
  const { user } = useAuth();

  // Calculate discounted total: subtotal + delivery_fee - pointsDiscount
  const subtotal = pendingOrder.subtotal || 0;
  const deliveryFee = pendingOrder.delivery_fee || 0;
  const pointsDiscount = pendingOrder.pointsDiscount || 0;
  const total = subtotal + deliveryFee;
  const discountedTotal = total - pointsDiscount;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a payment intent on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(discountedTotal * 100), // Use discounted total
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      const clientSecret = data.clientSecret;

      // Confirm the payment with Stripe
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.email || 'Guest',
          },
        },
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        try {
          await createOrder(paymentIntent.id);
        } catch (orderError) {
          // Log but do not block user
          console.error('Order creation failed after payment:', orderError);
        }
        clearCart();
        router.push('/order-success');
        return;
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment processing');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (paymentIntentId: string) => {
    if (!user) return;

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

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          subtotal, // sum of item prices
          delivery_fee: deliveryFee,
          order_total: discountedTotal, // true paid amount (subtotal + delivery_fee - pointsDiscount)
          points_discount: pointsDiscount,
          delivery_address: pendingOrder.delivery_address,
          phone: pendingOrder.phone,
          full_name: pendingOrder.full_name,
          payment_intent_id: paymentIntentId,
          payment_status: 'paid',
          status: 'pending',
          order_type: pendingOrder.order_type, // Pass order type for admin
          metadata: orderMetadata // Save all item details with options as JSON
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Handle royalty points
      if (orderData) {
        console.log('Payment form - Processing royalty points for order:', orderData.id);
        console.log('Payment form - Points to redeem:', pendingOrder.pointsToRedeem);
        console.log('Payment form - Points discount:', pendingOrder.pointsDiscount);
        
        // Deduct points if any were redeemed
        if (pendingOrder.pointsToRedeem && pendingOrder.pointsToRedeem > 0) {
          console.log('Payment form - Deducting points:', pendingOrder.pointsToRedeem);
          
          // Insert new transaction record for points spent
          const { error: insertError } = await supabase.from('royalty_points').insert({
            user_id: user.id,
            points_earned: 0,
            points_spent: pendingOrder.pointsToRedeem
          });

          if (insertError) {
            console.error('Payment form - Error updating royalty points:', insertError);
          } else {
            console.log('Payment form - Successfully deducted points');
          }
        }

        // Add points earned from the order (based on the actual amount paid)
        const pointsEarned = Math.floor(discountedTotal * 10); // 10 points per $1
        console.log('Payment form - Points to earn:', pointsEarned);
        console.log('Payment form - Discounted total:', discountedTotal);
        
        if (pointsEarned > 0) {
          console.log('Payment form - Adding points earned:', pointsEarned);
          
          // Insert new transaction record for points earned
          const { error: insertError } = await supabase.from('royalty_points').insert({
            user_id: user.id,
            points_earned: pointsEarned,
            points_spent: 0
          });

          if (insertError) {
            console.error('Payment form - Error adding points earned:', insertError);
          } else {
            console.log('Payment form - Successfully added points earned');
          }
        }
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Card Details</h3>
        <div className="border rounded-md p-4">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Test Card: 4242 4242 4242 4242, any future date, any CVC
        </p>
        <Button 
          type="submit" 
          className="w-full bg-red-600 hover:bg-red-700" 
          disabled={!stripe || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${discountedTotal.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}