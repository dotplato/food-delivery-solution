'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PointsDisplay } from './points-display';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const { items } = useCart();
  const { user, signOut } = useAuth();
  const supabase = createClientComponentClient();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching admin status:', error);
          return;
        }

        setIsAdmin(data?.is_admin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    }

    checkAdminStatus();
  }, [user, supabase]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  const isHomePage = pathname === '/';
  const totalItems = items?.length || 0;

  return (
    <>
      {/* Overlay placed outside header to ensure it's above all */}
      {isOpen && (
        <div
          className="
            fixed inset-0 
            z-[9999] 
            bg-black/95 
            backdrop-blur-md 
            flex flex-col 
            pointer-events-auto 
            transition-opacity duration-300
          "
        >
          {/* Top bar with close and home */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-white/10">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-2 text-white font-semibold text-lg hover:text-yellow-300"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMenu}
              className="text-white hover:text-red-500"
            >
              <X className="h-7 w-7" />
            </Button>
          </div>

          {/* Menu links */}
          <nav className="flex flex-col space-y-6 text-center px-6 py-8 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-lg font-medium transition-colors hover:text-red-500 py-2',
                  isActive(item.href)
                    ? 'text-red-500 font-semibold'
                    : 'text-white'
                )}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-[100] transition-all duration-300',
          isHomePage
            ? scrolled
              ? 'bg-black/70 backdrop-blur-md shadow-md py-2'
              : 'bg-transparent py-2'
            : 'bg-black/70 backdrop-blur-md shadow-md py-2'
        )}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Left Side - Hamburger Menu */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="text-white hover:text-red-500"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Center - Logo */}
          <div className="flex-1 flex justify-center">
            <Link
              href="/"
              className="text-2xl font-bold text-white"
              onClick={closeMenu}
            >
              <Image
                src="/logos/main-logo.png"
                alt="Bunhub Burgers Logo"
                width={130}
                height={130}
              />
            </Link>
          </div>

          {/* Right Side - Cart, Points, and Auth */}
          <div className="flex items-center space-x-4">
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:text-red-500"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-600 text-white">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Points Display */}
            <PointsDisplay />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-red-500"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="border-white hover:bg-zinc-200"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
