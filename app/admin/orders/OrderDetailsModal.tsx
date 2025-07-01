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
import { supabase } from "@/lib/supabase/client";
import { Order, OrderItem } from "@/lib/types";
import Loader from "@/components/ui/loader";
import Image from "next/image";

interface OrderDetailsModalProps {
  order: (Order & { order_type?: string; points_discount?: number }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      fetchOrderItems(order.id);
    }
  }, [isOpen, order]);

  const fetchOrderItems = async (orderId: string) => {
    setLoading(true);
    
    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .select("*, menu_item:menu_items(*)")
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      setLoading(false);
      return;
    }

    if (!itemsData) {
      setItems([]);
      setLoading(false);
      return;
    }

    const itemIds = itemsData.map(item => item.id);

    const { data: optionsData, error: optionsError } = await supabase
      .from("order_item_options")
      .select(`
        *,
        option:menu_item_options(*),
        addon:menu_item_addons(*),
        meal_option:meal_options(*)
      `)
      .in("order_item_id", itemIds);
    
    if (optionsError) {
      console.error("Error fetching order item options:", optionsError);
      setItems(itemsData as any[]);
      setLoading(false);
      return;
    }

    const itemsWithDetails = itemsData.map((item: any) => ({
      ...item,
      options: optionsData.filter((opt: any) => opt.order_item_id === item.id),
    }));

    setItems(itemsWithDetails as any[]);
    setLoading(false);
  };

  if (!order) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

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
                <p className="text-sm text-muted-foreground">{order.order_type ? order.order_type.charAt(0).toUpperCase() + order.order_type.slice(1) : 'N/A'}</p>
              </div>
            </div>
            
            <Separator />

            {/* Items */}
            <div>
              <h3 className="font-semibold mb-2">Items</h3>
              <div className="space-y-4">
                {items.map((item) => (
                   <div key={item.id} className="flex items-center gap-4">
                     <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                        {item.menu_item?.image_url ? (
                          <Image
                            src={item.menu_item.image_url}
                            alt={item.menu_item.name}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                     </div>
                     <div className="flex-grow">
                        <p className="font-medium">{item.menu_item?.name || 'Unknown Item'}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                        {item.options && item.options.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.options.map((opt: any) => (
                              <div key={opt.id}>
                                • {opt.option?.name || opt.addon?.name || opt.meal_option?.name}
                                {opt.price_adjustment > 0 && ` (+$${opt.price_adjustment.toFixed(2)})`}
                              </div>
                            ))}
                          </div>
                        )}
                     </div>
                     <p className="font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
                   </div>
                ))}
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
                    <span>${((order.total - (order.points_discount || 0))).toFixed(2)}</span>
                </div>
            </div>

             <Separator />

            <div className="flex justify-between items-center">
                 <div>
                     <span className="text-muted-foreground text-sm">Status: </span>
                     <Badge className="capitalize">{order.status}</Badge>
                 </div>
                 <div>
                     <span className="text-muted-foreground text-sm">Payment: </span>
                     <Badge variant="secondary" className="capitalize">{order.payment_status}</Badge>
                 </div>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 