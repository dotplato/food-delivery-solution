'use client';

import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/context/auth-context';

export function PointsDisplay() {
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchPoints = async () => {
      if (!user?.id) {
        setPoints(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('royalty_points')
          .select('current_balance')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          setPoints(data.current_balance || 0);
        } else {
          setPoints(0);
        }
      } catch (error) {
        console.error('Error fetching points:', error);
        setPoints(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [user, supabase]);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full">
      <Coins className="w-4 h-4 text-yellow-600" />
      <span className="text-sm font-medium text-yellow-800">
        {loading ? '...' : points?.toLocaleString() || '0'}
      </span>
      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
        pts
      </Badge>
    </div>
  );
} 