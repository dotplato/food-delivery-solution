"use client";

import { Badge } from "@/components/ui/badge";

type Status = "pending" | "processing" | "completed" | "cancelled" | "failed";

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles: { [key in Status]: { variant: "default" | "secondary" | "destructive" | "outline", className: string } } = {
    pending: { variant: "outline", className: "border-yellow-500 text-yellow-500" },
    processing: { variant: "outline", className: "border-blue-500 text-blue-500" },
    completed: { variant: "default", className: "bg-green-500 text-white" },
    cancelled: { variant: "destructive", className: "bg-red-500 text-white" },
    failed: { variant: "destructive", className: "bg-orange-500 text-white" },
  };

  const { variant, className } = statusStyles[status] || { variant: "secondary", className: "" };

  return (
    <Badge variant={variant} className={`capitalize ${className}`}>
      {status.replace("_", " ")}
    </Badge>
  );
} 