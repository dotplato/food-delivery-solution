'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';
import { OrderHistory } from '@/components/profile/order-history';
import { toast } from 'sonner';

const profileSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }).optional().or(z.literal('')),
  address: z.string().min(5, { message: 'Please enter a valid address' }).optional().or(z.literal('')),
});

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (!user) {
      router.push('/signin?redirect=/profile');
      return;
    }

    fetchProfile();
  }, [user, router]);

  async function fetchProfile() {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      
      if (data) {
        form.reset({
          fullName: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          phone: values.phone,
          address: values.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return null; // Will redirect to signin in useEffect
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                {loading ? (
                  <div className="bg-card border rounded-lg p-8 flex justify-center items-center h-80">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="bg-card border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                    <Separator className="mb-6" />
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(123) 456-7890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delivery Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St, City, State 12345" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </div>
              
              <div>
                <div className="bg-card border rounded-lg p-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="font-medium text-lg">{profile?.full_name || user.email}</h3>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                  </div>
                  
                  <Separator className="mb-6" />
                  
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push('/orders')}
                    >
                      View Orders
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-destructive hover:text-destructive"
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="orders">
            <OrderHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}