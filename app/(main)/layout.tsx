import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { OrderTypeDialogProvider } from "@/components/location/OrderTypeDialogProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrderTypeDialogProvider>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </OrderTypeDialogProvider>
  );
} 