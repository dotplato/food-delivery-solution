"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import Loader from '@/components/ui/loader';

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, user:profiles(full_name, email)")
      .order("created_at", { ascending: false });
    if (!error) setOrders(data || []);
    setLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-2">View and manage all customer orders</p>
        </div>
      </div>
      <Card>
        <CardContent>
          {loading ? (
            <Loader />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Order ID</th>
                  <th className="text-left">User</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Total</th>
                  <th className="text-left">Delivery Address</th>
                  <th className="text-left">Phone</th>
                  <th className="text-left">Payment Status</th>
                  <th className="text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.user?.full_name || order.user?.email || "-"}</td>
                    <td>{order.status}</td>
                    <td>${order.total?.toFixed(2)}</td>
                    <td>{order.delivery_address}</td>
                    <td>{order.phone}</td>
                    <td>{order.payment_status}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 