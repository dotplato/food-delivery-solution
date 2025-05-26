'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    full_name: string;
    phone: string;
    address: string;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Profile Page - Session:', {
          hasSession: !!session,
          userId: session?.user?.id,
          sessionError: sessionError?.message
        });

        if (sessionError) {
          console.error('Profile Page - Session error:', sessionError);
          router.push('/login');
      return;
    }

        if (!session) {
          console.log('Profile Page - No session found, redirecting to login');
          router.push('/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
          .eq('id', session.user.id)
        .single();

        console.log('Profile Page - Profile data:', {
          profile,
          profileError: profileError?.message
        });

        if (profileError) {
          console.error('Profile Page - Error fetching profile:', profileError);
          toast.error('Failed to load profile');
          return;
        }

        setProfile(profile);
    } catch (error) {
        console.error('Profile Page - Unexpected error:', error);
        toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
    };

    fetchProfile();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('Profile Page - No session found during update');
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile?.full_name,
          phone: profile?.phone,
          address: profile?.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      console.log('Profile Page - Update result:', {
        error: error?.message
      });

      if (error) {
        console.error('Profile Page - Error updating profile:', error);
        toast.error('Failed to update profile');
        return;
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile Page - Unexpected error during update:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Loading profile...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile?.full_name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, full_name: e.target.value }))}
                required
              />
                  </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile?.phone || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, phone: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={profile?.address || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, address: e.target.value }))}
                required
              />
      </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}