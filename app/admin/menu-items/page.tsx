'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { MenuItem } from '@/lib/types';
import type { Database } from '@/lib/types/database.types';
import type { Category } from '@/lib/types';
import { MenuItemDialog } from './menu-item-dialog';
import Loader from '@/components/ui/loader';

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }: any) => <div>${row.original.price.toFixed(2)}</div>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }: any) => (
      <div>{row.original.category?.name || 'Uncategorized'}</div>
    ),
  },
  {
    accessorKey: 'available',
    header: 'Status',
    cell: ({ row }: any) => (
      <Badge variant={row.original.available ? 'default' : 'secondary'}>
        {row.original.available ? 'Available' : 'Unavailable'}
      </Badge>
    ),
  },
  {
    accessorKey: 'featured',
    header: 'Featured',
    cell: ({ row }: any) => (
      <Badge variant={row.original.featured ? 'default' : 'outline'}>
        {row.original.featured ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => row.original.onEdit(row.original)}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => row.original.onDelete(row.original.id)}
        >
          Delete
        </Button>
      </div>
    ),
  },
];

export default function MenuItemsPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (!error) setCategories(data || []);
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add action handlers to each item
      const itemsWithActions = data.map((item) => ({
        ...item,
        onEdit: (item: MenuItem) => {
          setSelectedItem(item);
          setDialogOpen(true);
        },
        onDelete: async (id: string) => {
          if (confirm('Are you sure you want to delete this item?')) {
            try {
              const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id);

              if (error) throw error;
              router.refresh();
            } catch (error) {
              console.error('Error deleting menu item:', error);
              alert('Failed to delete menu item');
            }
          }
        },
      }));

      setMenuItems(itemsWithActions);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item: Partial<MenuItem>) => {
    try {
      if (selectedItem) {
        // Update existing item
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
          } satisfies Database['public']['Tables']['menu_items']['Update'])
          .eq('id', selectedItem.id);

        if (error) throw error;
      } else {
        // Create new item
        const { error } = await supabase
          .from('menu_items')
          .insert({
            name: item.name!,
            description: item.description,
            price: item.price!,
            image_url: item.image_url,
            category_id: item.category_id,
            available: item.available ?? true,
            featured: item.featured ?? false,
          } satisfies Database['public']['Tables']['menu_items']['Insert']);

        if (error) throw error;
      }

      setDialogOpen(false);
      setSelectedItem(null);
      router.refresh();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  // Filter menu items by selected category
  const filteredMenuItems = selectedCategory
    ? menuItems.filter((item) => item.category_id === selectedCategory)
    : menuItems;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Items</h1>
          <p className="text-muted-foreground mt-2">
            Manage your restaurant's menu items
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Category Filter */}
      <div className="mb-4 flex gap-2 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          id="category-filter"
          className="border rounded px-2 py-1"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="">All</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <DataTable
          columns={columns}
          data={filteredMenuItems}
        />
      )}

      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={selectedItem}
        onSave={handleSave}
      />
    </div>
  );
} 