'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Order, OrderItem, MenuItem } from '@/lib/types';

export function ClientOrderDetails() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id[0];
  const { user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/signin?redirect=/orders');
      return;
    }

    fetchOrder();
  }, [user, id, router]);

  async function fetchOrder() {
    if (!user || !id) return;

    setLoading(true);
    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (orderError) throw orderError;
      if (!orderData) {
        router.push('/orders');
        return;
      }

      setOrder(orderData);

      // Fetch order items with menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          menu_item:menu_items(*)
        `)
        .eq('order_id', id);

      if (itemsError) throw itemsError;
      
      // Transform the data to match OrderItem type
      const transformedItems = (itemsData || []).map(item => ({
        ...item,
        menu_item: item.menu_item as MenuItem | undefined
      }));
      
      setOrderItems(transformedItems);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Link href="/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/orders" className="inline-flex items-center text-primary hover:underline">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Orders
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Order Details</h1>
                  <p className="text-muted-foreground">
                    Order #{order.id.substring(0, 8)}
                  </p>
                </div>
                <Badge 
                  className="mt-2 sm:mt-0 capitalize"
                  variant={
                    order.status === 'completed' ? 'default' : 
                    order.status === 'cancelled' ? 'destructive' : 
                    'outline'
                  }
                >
                  {order.status}
                </Badge>
              </div>

              <Separator className="mb-6" />

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="space-y-4">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex border-b pb-4">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          {item.menu_item?.image_url ? (
                            <Image
                              src={item.menu_item.image_url}
                              alt={item.menu_item.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-grow">
                          <p className="font-medium">{item.menu_item?.name || 'Unknown Item'}</p>
                          <div className="flex justify-between mt-1">
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} x ${item.price.toFixed(2)}
                            </p>
                            <p className="font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>
                        ${(order.total - order.delivery_fee).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>${order.delivery_fee.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Order Information</h3>
              <Separator className="mb-4" />
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p>{format(new Date(order.created_at), 'MMM dd, yyyy h:mm a')}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge variant="outline" className="capitalize">
                    {order.payment_status}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p>{order.delivery_address || 'Not specified'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Contact Phone</p>
                  <p>{order.phone || 'Not specified'}</p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <Button className="w-full" asChild>
                <Link href="/menu">Order Again</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 