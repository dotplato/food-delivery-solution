'use client';

import { Coins, Sparkles, ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PointsSectionProps {
  userPoints: number;
  redeemPoints: boolean;
  pointsToRedeem: number;
  pointsDiscount: number;
  total: number;
  onRedeemChange: (checked: boolean) => void;
}

export function PointsSection({ 
  userPoints, 
  redeemPoints, 
  pointsToRedeem, 
  pointsDiscount, 
  total,
  onRedeemChange 
}: PointsSectionProps) {
  const dollarValue = userPoints / 100; // 100 points = $1

  return (
    <div className="space-y-4">
      {/* Available Points Display */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-md">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                {/* Sparkles around the coin */}
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
                </div>
                <div className="absolute -bottom-0.5 -left-0.5">
                  <Sparkles className="w-2 h-2 text-orange-400 animate-pulse delay-75" />
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {userPoints.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Available Points</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-700">
                ${dollarValue.toFixed(2)} value
              </div>
              <div className="text-xs text-gray-500">
                100 pts = $1
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redeem Points Option */}
      {userPoints > 0 && (
        <Card className="border-2 border-gray-200 hover:border-yellow-300 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="redeem-points"
                checked={redeemPoints}
                onCheckedChange={(checked) => onRedeemChange(checked as boolean)}
                className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
              />
              <Label htmlFor="redeem-points" className="cursor-pointer flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Redeem Points</div>
                    <div className="text-sm text-gray-600">
                      Use your points for a discount
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    Save ${(userPoints / 100).toFixed(2)}
                  </Badge>
                </div>
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points Applied Display */}
      {redeemPoints && pointsDiscount > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                  <ArrowDown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-green-700">
                    Points Applied
                  </div>
                  <div className="text-sm text-green-600">
                    {pointsToRedeem.toLocaleString()} points redeemed
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-700">
                  -${pointsDiscount.toFixed(2)}
                </div>
                <div className="text-xs text-green-600">Discount Applied</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points to Earn Display */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <ArrowUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-blue-700">
                  Points to Earn
                </div>
                <div className="text-sm text-blue-600">
                  You'll earn points from this order
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-700">
                +{Math.floor((total - (redeemPoints ? pointsDiscount : 0)) * 10)}
              </div>
              <div className="text-xs text-blue-600">Points (10 per $1)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 