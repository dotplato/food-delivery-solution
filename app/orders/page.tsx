import { ClientOrderHistory } from './client-order-history';

export const metadata = {
  title: 'My Orders | BurgerBliss',
  description: 'View your order history and track current orders',
};

export default function OrdersPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ClientOrderHistory />
      </div>
    </div>
  );
}