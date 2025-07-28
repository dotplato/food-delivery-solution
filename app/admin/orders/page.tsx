"use client";
import { useEffect, useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import Loader from "@/components/ui/loader";
import { Order } from "@/lib/types";
import { OrderDetailsModal } from "./OrderDetailsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { subDays, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type FilterType = "all" | "today" | "week" | "month";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, activeFilter]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      console.error("orders error:", error);
    } else {
      setOrders(data as any[] || []);
    }
    setLoading(false);
  };
  
  const filterOrders = () => {
    let startDate: Date;
    switch (activeFilter) {
      case "today":
        startDate = startOfDay(new Date());
        break;
      case "week":
        startDate = subDays(new Date(), 7);
        break;
      case "month":
        startDate = subDays(new Date(), 90);
        break;
      case "all":
      default:
        setFilteredOrders(orders);
        return;
    }
    const filtered = orders.filter(
      (order) => new Date(order.created_at) >= startDate
    );
    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error(`Failed to update status: ${error.message}`);
    } else {
      toast.success("Order status updated.");
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
    setUpdatingOrderId(null);
  };
  
  const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error(`Failed to update payment status: ${error.message}`);
    } else {
      toast.success("Payment status updated.");
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, payment_status: newStatus } : o))
      );
    }
    setUpdatingOrderId(null);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 text-yellow-500 hover:bg-yellow-500/10";
      case "processing":
        return "border-blue-500 text-blue-500 hover:bg-blue-500/10";
      case "completed":
        return "border-green-500 text-green-500 hover:bg-green-500/10";
        case "paid":
          return "border-green-500 text-green-500 hover:bg-green-500/10";
      case "cancelled":
        return "border-red-500 text-red-500 hover:bg-red-500/10";
      case "failed":
        return "border-orange-500 text-orange-500 hover:bg-orange-500/10";
      case "cash_on_delivery":
        return "border-gray-500 text-gray-500 hover:bg-gray-500/10";
      default:
        return "";
    }
  };

  const FilterButton = ({
    filter,
    label,
  }: {
    filter: FilterType;
    label: string;
  }) => (
    <Button
      variant={activeFilter === filter ? "default" : "outline"}
      onClick={() => setActiveFilter(filter)}
    >
      {label}
    </Button>
  );

  return (
    <div>
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all customer orders
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
             <CardTitle>
              {filteredOrders.length} Order(s)
            </CardTitle>
            <div className="flex gap-2">
              <FilterButton filter="all" label="All" />
              <FilterButton filter="today" label="Today" />
              <FilterButton filter="week" label="Last Week" />
              <FilterButton filter="month" label="Last 3 Months" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="text-red-600 text-center py-10">Error: {error}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-4">Customer</TableHead>
                    <TableHead className="p-4">Created</TableHead>
                    <TableHead className="p-4">Total</TableHead>
                    <TableHead className="p-4">Status</TableHead>
                    <TableHead className="p-4">Payment</TableHead>
                    <TableHead className="p-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-b hover:bg-muted/50">
                      <TableCell className="p-4">
                        <p className="font-medium">{order.full_name || 'Guest'}</p>
                        <p className="font-mono text-xs text-muted-foreground">{order.id.substring(0,8)}...</p>
                      </TableCell>
                      <TableCell className="p-4">
                        {new Date(order.created_at).toLocaleString([], {
                           dateStyle: 'short',
                           timeStyle: 'short'
                        })}
                      </TableCell>
                      <TableCell className="p-4 font-medium">
                        ${order.order_total?.toFixed(2)}
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center gap-2">
                          {updatingOrderId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusChange(order.id, value)}
                            >
                              <SelectTrigger className={cn("w-32 h-8 text-xs capitalize", getStatusClass(order.status))}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center gap-2">
                          {updatingOrderId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Select
                              value={order.payment_status}
                              onValueChange={(value) => handlePaymentStatusChange(order.id, value)}
                            >
                              <SelectTrigger className={cn("w-36 h-8 text-xs capitalize", getStatusClass(order.payment_status))}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 