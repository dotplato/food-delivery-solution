'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    async function checkAuth() {
      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session:', session);
      console.log('Session Error:', sessionError);

      if (session) {
        // Check profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        console.log('Profile:', profile);
        console.log('Profile Error:', profileError);
      }
    }

    checkAuth();
  }, []);

  useEffect(() => {
    async function fetchStats() {
      // Fetch total orders and revenue
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total');

      if (!ordersError && ordersData) {
        const totalRevenue = ordersData.reduce(
          (sum, order) => sum + (order.total || 0),
          0
        );
        setStats((prev) => ({
          ...prev,
          totalOrders: ordersData.length,
          totalRevenue,
        }));
      }

      // Fetch total users
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (!usersError) {
        setStats((prev) => ({
          ...prev,
          totalUsers: usersCount || 0,
        }));
      }

      // Fetch total products
      const { count: productsCount, error: productsError } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });

      if (!productsError) {
        setStats((prev) => ({
          ...prev,
          totalProducts: productsCount || 0,
        }));
      }
    }

    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      description: 'Total number of orders',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      description: 'Total revenue from orders',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'Total number of registered users',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      description: 'Total number of menu items',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Overview of your restaurant's performance
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 