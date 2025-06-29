"use client";
import { useEffect, useState } from "react";
import { FirstVisitOrderTypeDialog } from "./FirstVisitOrderTypeDialog";

export function OrderTypeDialogProvider({ children }: { children: React.ReactNode }) {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const orderType = localStorage.getItem('order_type');
      if (!orderType) setShowDialog(true);
    }
  }, []);

  return (
    <>
      <FirstVisitOrderTypeDialog open={showDialog} onClose={() => setShowDialog(false)} />
      {children}
    </>
  );
} 