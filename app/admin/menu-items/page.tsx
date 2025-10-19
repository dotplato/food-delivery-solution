'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { MenuItemDialog } from './menu-item-dialog';
import Loader from '@/components/ui/loader';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { MenuItem, Category } from '@/lib/types';
import {
  fetchCategories,
  fetchMenuItemsWithCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '@/lib/fetch/admin/menu-items-helper'; // ✅ helper import

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
          variant="ghost"
          size="icon"
          aria-label="Edit"
          onClick={() => row.original.onEdit(row.original)}
          className="mr-2"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete"
          onClick={() => row.original.onDelete(row.original.id)}
        >
          <Trash className="h-4 w-4 text-red-500" />
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [cats, items] = await Promise.all([
      fetchCategories(),
      fetchMenuItemsWithCategory(),
    ]);

    // Add actions directly to items
    const itemsWithActions = items.map((item) => ({
      ...item,
      onEdit: (itm: MenuItem) => {
        setSelectedItem(itm);
        setDialogOpen(true);
      },
      onDelete: async (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
          const success = await deleteMenuItem(id);
          if (success) router.refresh();
          else alert('Failed to delete menu item');
        }
      },
    }));

    setCategories(cats);
    setMenuItems(itemsWithActions);
    setLoading(false);
  };

  const handleSave = async (item: Partial<MenuItem>) => {
    let success = false;
    if (selectedItem) {
      success = await updateMenuItem(selectedItem.id, item);
    } else {
      success = await addMenuItem(item);
    }

    if (success) {
      setDialogOpen(false);
      setSelectedItem(null);
      router.refresh();
    } else {
      alert('Failed to save menu item');
    }
  };

  const filteredMenuItems =
    selectedCategories.length === 0
      ? menuItems
      : menuItems.filter(
          (item) =>
            item.category_id &&
            selectedCategories.includes(item.category_id)
        );

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
      <div className="mb-4 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              Filter by Category
              {selectedCategories.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({selectedCategories.length})
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {categories.map((cat) => (
              <DropdownMenuCheckboxItem
                key={cat.id}
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={(checked) => {
                  setSelectedCategories((prev) =>
                    checked
                      ? [...prev, cat.id]
                      : prev.filter((id) => id !== cat.id)
                  );
                }}
              >
                {cat.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <DataTable columns={columns} data={filteredMenuItems} />
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
