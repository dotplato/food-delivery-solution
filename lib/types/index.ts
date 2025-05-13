export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  available: boolean;
  featured: boolean;
  created_at: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

export type Order = {
  id: string;
  user_id: string | null;
  status: string;
  total: number;
  delivery_address: string | null;
  delivery_fee: number;
  phone: string | null;
  payment_intent_id: string | null;
  payment_status: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  quantity: number;
  price: number;
  created_at: string;
  menu_item?: MenuItem;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export type PendingOrder = {
  items: CartItem[];
  delivery_address?: string;
  phone?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
};