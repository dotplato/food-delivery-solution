"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { supabase } from "@/lib/supabase/client";
import { Order, MenuItem } from "@/lib/types";
import Loader from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area } from "recharts";
import Image from "next/image";

interface SalesData {
  product_id: string;
  product_name: string;
  image_url: string | null;
  total_sold: number;
  revenue: number;
  sales_over_time: { date: string; count: number }[];
  most_active_time?: string;
  trend?: "up" | "down" | "flat";
}

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  useEffect(() => {
    fetchSalesData();
  }, []);

  const calculateMostActiveTime = (sales: { date: string, count: number }[]) => {
    const dayOfWeekCounts: { [key: number]: number } = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };
    sales.forEach(sale => {
      const day = new Date(sale.date).getDay();
      dayOfWeekCounts[day] += sale.count;
    });
    const mostActiveDay = Object.keys(dayOfWeekCounts).reduce((a, b) => dayOfWeekCounts[parseInt(a)] > dayOfWeekCounts[parseInt(b)] ? a : b);
    const dayNames = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
    return dayNames[parseInt(mostActiveDay)];
  };
  
  const calculateTrend = (sales: { date: string, count: number }[]): "up" | "down" | "flat" => {
    if (sales.length < 2) return "flat";
    const firstHalf = sales.slice(0, Math.floor(sales.length / 2)).reduce((acc, s) => acc + s.count, 0);
    const secondHalf = sales.slice(Math.floor(sales.length / 2)).reduce((acc, s) => acc + s.count, 0);
    if(secondHalf > firstHalf) return "up";
    if(secondHalf < firstHalf) return "down";
    return "flat";
  }

  const fetchSalesData = async () => {
    setLoading(true);

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        status,
        order_total,
        metadata
      `);

    if (ordersError) {
      console.error("Error fetching sales data:", ordersError);
      setLoading(false);
      return;
    }

    if (!orders || orders.length === 0) {
      setSalesData([]);
      setLoading(false);
      return;
    }

    const aggregatedData: { [key: string]: SalesData } = {};

    for (const order of orders) {
      if (!order.metadata || !Array.isArray(order.metadata)) continue;

      for (const item of order.metadata) {
        const key = item.menu_item_id;
        if (!aggregatedData[key]) {
          aggregatedData[key] = {
            product_id: item.menu_item_id,
            product_name: item.name,
            image_url: null, // We don't have image_url in metadata
            total_sold: 0,
            revenue: 0,
            sales_over_time: [],
          };
        }

        aggregatedData[key].total_sold += item.quantity;
        aggregatedData[key].revenue += item.quantity * item.price;

        const date = new Date(order.created_at).toISOString().split("T")[0];
        const timeEntry = aggregatedData[key].sales_over_time.find(
          (t) => t.date === date
        );
        if (timeEntry) {
          timeEntry.count += item.quantity;
        } else {
          aggregatedData[key].sales_over_time.push({
            date,
            count: item.quantity,
          });
        }
      }
    }
    
    const finalData = Object.values(aggregatedData).map(d => ({
        ...d,
        most_active_time: calculateMostActiveTime(d.sales_over_time),
        trend: calculateTrend(d.sales_over_time)
    })).sort((a, b) => b.total_sold - a.total_sold);

    setSalesData(finalData);
    setLoading(false);
  };

  const chartData =
    selectedProduct === "all"
      ? salesData
          .flatMap((d) => d.sales_over_time)
          .reduce((acc, cur) => {
            const existing = acc.find((a) => a.date === cur.date);
            if (existing) {
              existing.sales += cur.count;
            } else {
              acc.push({ date: cur.date, sales: cur.count });
            }
            return acc;
          }, [] as { date: string; sales: number }[])
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      : salesData
          .find((d) => d.product_id === selectedProduct)
          ?.sales_over_time.map((s) => ({ date: s.date, sales: s.count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
        <p className="text-muted-foreground mt-2">
          An overview of your menu item sales performance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader />
          ) : (
            <div className="relative max-h-[480px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Total Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Most Active Time</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.length > 0 ? (
                    salesData.map((data) => (
                      <TableRow key={data.product_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Image
                              src={data.image_url || '/images/placeholder.jpg'}
                              alt={data.product_name}
                              width={40}
                              height={40}
                              className="rounded-md object-cover h-10 w-10"
                            />
                            <span>{data.product_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{data.total_sold}</TableCell>
                        <TableCell>${data.revenue.toFixed(2)}</TableCell>
                        <TableCell>{data.most_active_time}</TableCell>
                        <TableCell>
                          {data.trend === "up" && <TrendingUp className="text-green-500" />}
                          {data.trend === "down" && <TrendingDown className="text-red-500" />}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No sales data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
           <div className="flex justify-between items-center">
            <div>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>
                {selectedProduct === "all"
                  ? "Overall sales trend"
                  : `Trend for ${
                      salesData.find((d) => d.product_id === selectedProduct)
                        ?.product_name
                    }`}
              </CardDescription>
            </div>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {salesData.map((product) => (
                  <SelectItem key={product.product_id} value={product.product_id}>
                    {product.product_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader />
          ) : (
            <div className="w-full h-64">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <AreaChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="sales"
                    type="monotone"
                    fill="url(#colorSales)"
                    stroke="var(--color-sales)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 