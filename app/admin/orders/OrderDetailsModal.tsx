"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Order } from "@/lib/types";
import Loader from "@/components/ui/loader";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

interface OrderDetailsModalProps {
  order: (Order & { order_type?: string; points_discount?: number; metadata?: any[] }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [denying, setDenying] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (isOpen && order) {
      setLoading(false);
    }
  }, [isOpen, order]);

  if (!order) return null;

  // Parse metadata from the order
  const orderItems = order.metadata || [];
  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // --- Accept order ---
  const handleAccept = async () => {
    try {
      setAccepting(true);
      const { error } = await supabase
        .from("orders")
        .update({ status: "accepted" })
        .eq("id", order.id);

      if (error) throw error;

      toast.success("Order accepted successfully!");
      onClose(); // close modal
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to accept order.");
    } finally {
      setAccepting(false);
    }
  };

  // --- Deny order ---
  const handleDeny = async () => {
    try {
      setDenying(true);
      const { error } = await supabase
        .from("orders")
        .update({ status: "denied" })
        .eq("id", order.id);

      if (error) throw error;

      toast.error("Order denied.");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to deny order.");
    } finally {
      setDenying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>Order ID: {order.id.substring(0, 8)}...</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader />
          </div>
        ) : (
          <div className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Customer & Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Customer</h3>
                <p className="text-sm font-medium">{order.full_name || "Guest"}</p>
                <p className="text-sm text-muted-foreground">{order.phone}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Delivery Address</h3>
                <p className="text-sm text-muted-foreground">{order.delivery_address || "N/A"}</p>
                <h3 className="font-semibold mt-4">Order Type</h3>
                <p className="text-sm text-muted-foreground">
                  {order.order_type
                    ? order.order_type.charAt(0).toUpperCase() + order.order_type.slice(1)
                    : "N/A"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div>
              <h3 className="font-semibold mb-2">Items</h3>
              <div className="space-y-4">
                {orderItems.map((item, index) => {
                  const options = item.options || {};
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">Item</span>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium">{item.name || "Unknown Item"}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} x ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>${order.delivery_fee.toFixed(2)}</span>
              </div>
              {order.points_discount && order.points_discount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Points Discount</span>
                  <span>- ${order.points_discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${order.order_total.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            {/* Status badges */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-muted-foreground text-sm">Status: </span>
                <Badge className="capitalize">{order.status}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Payment: </span>
                <Badge variant="secondary" className="capitalize">
                  {order.payment_status}
                </Badge>
              </div>
            </div>

            {/* Admin Controls */}
            {order.status === "pending" && (
              <div className="flex justify-end gap-3 pt-4 mb-4">
                <Button
                  variant="destructive"
                  onClick={handleDeny}
                  disabled={accepting || denying}
                >
                  {denying ? "Processing..." : "Deny"}
                </Button>
                <Button onClick={handleAccept} disabled={accepting || denying}>
                  {accepting ? "Processing..." : "Accept"}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
