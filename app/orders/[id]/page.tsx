import { ClientOrderDetails } from './client-order-details';

export const metadata = {
  title: 'Order Details | BurgerBliss',
  description: 'View your order details and track its status',
};

export async function generateStaticParams() {
  // Since orders are dynamic and user-specific, we'll return an empty array
  // This tells Next.js that this is a dynamic route that doesn't need static generation
  return [];
}

export default function OrderDetailsPage() {
  return <ClientOrderDetails />;
}