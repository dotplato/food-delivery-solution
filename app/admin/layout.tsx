'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Package,
  ShoppingCart,
  X,
  BarChart,
  Home,
  ClipboardList
} from 'lucide-react';
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/auth-context";
import { NewOrderNotifier } from "./NewOrderNotifier";

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Orders', href: '/admin/orders', icon: ClipboardList },
  { name: 'Products', href: '/admin/menu-items', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: ShoppingCart },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="flex gap-0 min-h-screen relative">
        <div className="lg:w-64 flex-shrink-0">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        <main className="flex-1 p-8 ">
          <NewOrderNotifier />
          {children}
        </main>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

function Sidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void; }) {
  const pathname = usePathname();

  return (
    <div className="h-screen sticky top-0 border-r bg-background  ">
      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-50 md:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
      >
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/admin" className="text-xl font-bold">
              BHB ADMIN
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-2 py-6 text-sm font-medium rounded-xl',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="  lg:inset-y-0 lg:flex lg:w-full lg:h-full lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col ">
          <div className="flex h-16 items-center px-4">
            <Link href="/admin" className="text-xl font-bold text-red-500">
              BHB ADMIN
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-4 text-sm font-medium rounded-xl',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

 
    </div>
  );
} 