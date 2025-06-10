'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import Logo from '@/logos/main-logo.png';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
        // Simplified query to just check is_admin
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
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isHomePage
          ? scrolled 
            ? 'bg-black/95 backdrop-blur-md shadow-md py-2'
            : 'bg-transparent py-2'
          : 'bg-black py-2'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between ">
        <Link href="/" className="text-2xl font-bold text-white" onClick={closeMenu}>
          <Image src={Logo} alt="BurgerBliss Logo" width={130} height={130} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-base font-medium transition-colors hover:text-red-500',
                isActive(item.href) 
                  ? 'text-red-500 font-semibold'
                  : 'text-white'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Nav */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-white hover:text-red-500">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-600 text-white">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-red-500">
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
              <Button variant="outline" className="border-white hover:bg-zinc-200">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-white hover:text-red-500">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-600 text-white">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-white hover:text-red-500">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md pt-20 px-6 md:hidden">
          <nav className="flex flex-col space-y-6 text-center">
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
            
            {user ? (
              <>
                <Link 
                  href="/profile" 
                  className="text-lg font-medium text-white hover:text-red-500"
                  onClick={closeMenu}
                >
                  My Profile
                </Link>
                <Link 
                  href="/orders" 
                  className="text-lg font-medium text-white hover:text-red-500"
                  onClick={closeMenu}
                >
                  My Orders
                </Link>
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="text-lg font-medium text-white hover:text-red-500"
                    onClick={closeMenu}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  className="w-full text-white border-white hover:bg-red-500 hover:border-red-500"
                  onClick={() => {
                    signOut();
                    closeMenu();
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/signin" onClick={closeMenu}>
                <Button variant="outline" className="w-full hover:bg-zinc-200">Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}