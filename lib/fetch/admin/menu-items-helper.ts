// /lib/fetch/admin/menu-items-helper.ts
import { supabase } from '@/lib/supabase/client';
import { MenuItem, Category } from '@/lib/types';

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch all menu items (with category info)
 */
export async function fetchMenuItemsWithCategory(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        category:categories(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

/**
 * Add a new menu item
 */
export async function addMenuItem(item: Partial<MenuItem>): Promise<boolean> {
  try {
    const { error } = await supabase.from('menu_items').insert({
      name: item.name!,
      description: item.description,
      price: item.price!,
      image_url: item.image_url,
      category_id: item.category_id,
      available: item.available ?? true,
      featured: item.featured ?? false,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding menu item:', error);
    return false;
  }
}

/**
 * Update an existing menu item
 */
export async function updateMenuItem(id: string, item: Partial<MenuItem>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('menu_items')
      .update({
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        category_id: item.category_id,
        available: item.available,
        featured: item.featured,
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating menu item:', error);
    return false;
  }
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }
}
