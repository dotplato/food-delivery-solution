import { Suspense } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Contact Us | BurgerBliss',
  description: 'Get in touch with our team for inquiries, feedback, or support',
};

export default function ContactPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have a question, feedback, or want to place a large order? We'd love to hear from you!
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
            
            <div className="bg-card border rounded-lg p-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="font-medium">Location</h3>
                    <p className="text-muted-foreground">
                      123 Burger Street, Foodville, NY 10001
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">
                      (123) 456-7890
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">
                      info@burgerbliss.com
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="font-medium">Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Friday: 11:00 AM - 10:00 PM
                      <br />
                      Saturday - Sunday: 10:00 AM - 11:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
              {/* This would be a Google Map in a real application */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">Interactive Map Would Be Here</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            
            <div className="bg-card border rounded-lg p-6">
              <Suspense fallback={<div>Loading form...</div>}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
        
        <Separator className="mb-16" />
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Do you offer vegetarian options?</h3>
              <p className="text-muted-foreground">
                Yes! We have a variety of vegetarian options including our plant-based burger patties, 
                vegetable sides, and salads. All are clearly marked on our menu.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">What is your delivery radius?</h3>
              <p className="text-muted-foreground">
                We deliver within a 5-mile radius of our restaurant. If you're outside this area, 
                you can still place orders for pickup.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">How long does delivery usually take?</h3>
              <p className="text-muted-foreground">
                Delivery times average 30-45 minutes depending on your location and current order volume. 
                You can track your delivery in real-time through our app.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Do you cater for events?</h3>
              <p className="text-muted-foreground">
                Absolutely! We offer catering for events of all sizes. Please contact us at least 
                48 hours in advance to discuss your requirements and place your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      
      // Reset submitted state after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }, 1500);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitted ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-md">
          <p className="font-medium">Message sent successfully!</p>
          <p className="text-sm">We'll get back to you as soon as possible.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Your Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="subject" className="block text-sm font-medium">
              Subject
            </label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="How can we help you?"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Tell us more about your inquiry..."
              className="resize-none"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </>
      )}
    </form>
  );
}