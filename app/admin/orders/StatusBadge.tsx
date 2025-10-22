"use client";

import { Badge } from "@/components/ui/badge";

type OrderStatus =
  | "pending"
  | "accepted"
  | "denied"
  | "processing"
  | "completed"
  | "cancelled"
  | "failed";

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles: Record<OrderStatus, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  pending:   { variant: "outline", className: "border-yellow-500 text-yellow-500" },
  accepted:  { variant: "default", className: "bg-green-500 text-white" },
  denied:    { variant: "destructive", className: "bg-red-500 text-white" },
  processing:{ variant: "outline", className: "border-blue-500 text-blue-500" },
  completed: { variant: "default", className: "bg-emerald-600 text-white" },
  cancelled: { variant: "destructive", className: "bg-red-400 text-white" },
  failed:    { variant: "destructive", className: "bg-orange-500 text-white" },
};

  const { variant, className } = statusStyles[status] || {
    variant: "secondary",
    className: "",
  };

  return (
    <Badge variant={variant} className={`capitalize ${className}`}>
      {status.replace("_", " ")}
    </Badge>
  );
}
