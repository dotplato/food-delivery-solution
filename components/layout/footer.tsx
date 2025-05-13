import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">BurgerBliss</h3>
            <p className="text-gray-400 mb-6">
              Serving delicious, juicy burgers made with premium ingredients since 2010. 
              Our mission is to provide the ultimate burger experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-gray-400 hover:text-white transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  123 Burger Street, Foodville, NY 10001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
                <span className="text-gray-400">(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
                <span className="text-gray-400">info@burgerbliss.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-xl font-bold mb-4">Opening Hours</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Monday - Friday</p>
                  <p className="text-white">11:00 AM - 10:00 PM</p>
                </div>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Saturday - Sunday</p>
                  <p className="text-white">10:00 AM - 11:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} BurgerBliss. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}