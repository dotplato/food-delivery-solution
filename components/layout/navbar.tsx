'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
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

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-md py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary" onClick={closeMenu}>
          Burger<span className="text-red-600">Bliss</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-base font-medium transition-colors hover:text-primary',
                isActive(item.href) 
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Nav */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
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
                <Button variant="ghost" size="icon">
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
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-600 text-white">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md pt-20 px-6 md:hidden">
          <nav className="flex flex-col space-y-6 text-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-lg font-medium transition-colors hover:text-primary py-2',
                  isActive(item.href) 
                    ? 'text-primary font-semibold'
                    : 'text-foreground'
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
                  className="text-lg font-medium"
                  onClick={closeMenu}
                >
                  My Profile
                </Link>
                <Link 
                  href="/orders" 
                  className="text-lg font-medium"
                  onClick={closeMenu}
                >
                  My Orders
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full"
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
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}