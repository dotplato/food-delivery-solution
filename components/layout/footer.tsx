"use client"
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { SubscribeForm } from '../subsribe/subscribe-form';

export function Footer() {


  return (
    <footer className="relative  pt-16 pb-8">
      {/* Creative background image at the bottom */}
      <div className="absolute left-0 right-0 bottom-0 z-0 pointer-events-none select-none">
        <Image src="/images/footer-bg.png" alt="Footer background" width={1600} height={1000} className="w-full  object-cover" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
      <div className="flex flex-col items-start">
            <Link href="/" className="mb-4 inline-block">
              <Image
                src="/logos/logo-brown.png"
                alt="Burger Bliss Logo"
                width={300}
                height={108}
                className="h-32 w-auto"
                priority
              />
            </Link>
      
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
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
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
                <div>
                  <p >Monday - Friday</p>
                  <p >11:00 AM - 10:00 PM</p>
                </div>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
                <div>
                  <p >Saturday - Sunday</p>
                  <p >10:00 AM - 11:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Subscribe for updates */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-12 mb-8 gap-4">
       <SubscribeForm/>
        </div>

{/* copyright section */}
        <hr className="border-gray-400/20 my-8" />

        <div className="flex flex-col  text-gray-200  items-center">
          <p className=" text-sm">
            &copy; {new Date().getFullYear()} BurgerBliss. All rights reserved.
          </p>
          <div className='flex gap-3 text-xs '>
          <Link href="/privacy" className=" hover:underline transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className=" hover:underline  transition-colors">
              Terms of Service
            </Link>
            </div>
        
     
        </div>
      </div>
    </footer>
  );
}