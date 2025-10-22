"use client";

import { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function PaymentForm({
  pendingOrder,
  orderStatus,
  onCreateOrder,
  onCardChange,
  orderId, // Add orderId as a prop
  onPaymentSuccess, // Add callback for payment success
}: {
  pendingOrder: any;
  orderStatus: string;
  onCreateOrder: (order: any) => Promise<string>;
  onCardChange?: (complete: boolean) => void;
  orderId?: string | null; // Add orderId prop
  onPaymentSuccess?: () => void; // Add callback for payment success
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  // Remove local orderId state since we're getting it as a prop

  // ✅ When admin accepts order, trigger automatic payment
  useEffect(() => {
    if (orderStatus === "accepted" && orderId) {
      console.log("Admin accepted order, triggering payment for orderId:", orderId);
      handlePayment();
    }
  }, [orderStatus, orderId]);

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement!,
      });

      if (error) {
        console.error(error);
        toast.error("Payment failed: " + error.message);
        setLoading(false);
        return;
      }

      // ✅ Use Next.js API route to create payment intent
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(pendingOrder.order_total * 100) }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create payment intent");
      }

      const paymentData = await res.json();

      // ✅ Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status === "succeeded") {
        // ✅ Update order status in Supabase
        const { error: updateError } = await supabase
          .from("orders")
          .update({ 
            payment_status: "paid",
            status: "processing",
            payment_intent_id: paymentIntent.id
          })
          .eq("id", orderId);

        if (updateError) {
          console.error("Failed to update order:", updateError);
          toast.error("Payment succeeded but failed to update order status.");
        } else {
          toast.success("✅ Payment successful! Order is now processing.");
          // Clear cart and redirect after successful payment
          onPaymentSuccess?.();
        }
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error("Payment failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!cardComplete) {
      alert("Please complete your card details first.");
      return;
    }

    setLoading(true);
    try {
      const createdOrderId = await onCreateOrder(pendingOrder);
      // The orderId will be handled by the parent component
      console.log("Order created with ID:", createdOrderId);
    } catch (err) {
      console.error("Order creation failed:", err);
      alert("Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": { color: "#aab7c4" },
              },
              invalid: { color: "#9e2146" },
            },
          }}
          onChange={(e) => {
            setCardComplete(e.complete);
            onCardChange?.(e.complete);
          }}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Test Card: 4242 4242 4242 4242 — any future date, any CVC
        </p>
        <Button
          id="stripePayButton"
          onClick={handlePlaceOrder}
          disabled={!cardComplete || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </div>
    </div>
  );
}
