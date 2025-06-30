"use client";

import { useState } from "react";
import { Order } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TodaysPendingOrdersProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  getStatusClass: (status: string) => string;
  onViewDetails: (order: Order) => void;
}

export function TodaysPendingOrders({ orders, onStatusChange, getStatusClass, onViewDetails }: TodaysPendingOrdersProps) {
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    await onStatusChange(orderId, newStatus);
    setUpdatingOrderId(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
            <CardTitle>Today's Pending Orders</CardTitle>
            <Link href="/admin/orders" passHref>
                 <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                </Button>
            </Link>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-muted-foreground">No pending orders for today.</p>
        ) : (
          <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
              >
                <div
                  className="cursor-pointer p-2 -m-2 rounded-md hover:bg-background transition-colors"
                  onClick={() => onViewDetails(order)}
                >
                  <p className="font-semibold">{order.full_name || "Guest"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium w-16 text-right">${order.total.toFixed(2)}</p>
                  <div className="flex items-center gap-2">
                    {updatingOrderId === order.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-32 h-8 text-xs capitalize",
                            getStatusClass(order.status)
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">
                            Processing
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 