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
  options?: MenuItemOption[];
  addons?: MenuItemAddon[];
  meal_options?: MealOption[];
};

export type CartItem = MenuItem & {
  quantity: number;
  options?: {
    selectedOption?: MenuItemOption;
    selectedAddons: MenuItemAddon[];
    selectedMealOptions?: MealOption[];
  };
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
  options?: OrderItemOption[];
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

export type MenuItemOption = {
  id: string;
  menu_item_id: string;
  name: string;
  description: string | null;
  price_adjustment: number;
  is_required: boolean;
  created_at: string;
};

export type MenuItemAddon = {
  id: string;
  menu_item_id: string;
  name: string;
  description: string | null;
  price_adjustment: number;
  is_required: boolean;
  created_at: string;
};

export type MealOption = {
  id: string;
  menu_item_id: string;
  name: string;
  description: string | null;
  price_adjustment: number;
  created_at: string;
};

export type OrderItemOption = {
  id: string;
  order_item_id: string;
  option_id: string | null;
  addon_id: string | null;
  meal_option_id: string | null;
  price_adjustment: number;
  created_at: string;
  option?: MenuItemOption;
  addon?: MenuItemAddon;
  meal_option?: MealOption;
};