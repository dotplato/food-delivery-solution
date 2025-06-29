import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <hr className="border-gray-400/20 mt-8" />

      <Footer />
    </>
  );
} 