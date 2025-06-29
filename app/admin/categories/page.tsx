"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";
import Loader from '@/components/ui/loader';

// CategoryDialog component (inline for now)
function CategoryDialog({ open, onOpenChange, category, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSave: (item: Partial<Category>) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: ""
  });
  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image_url: category.image_url || ""
      });
    } else {
      setForm({ name: "", slug: "", description: "", image_url: "" });
    }
  }, [category]);
  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">{category ? "Edit Category" : "Add Category"}</h2>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input className="w-full border rounded px-2 py-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Slug</label>
            <input className="w-full border rounded px-2 py-1" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <input className="w-full border rounded px-2 py-1" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Image URL</label>
            <input className="w-full border rounded px-2 py-1" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (!error) setCategories(data || []);
    setLoading(false);
  };

  const handleSave = async (item: Partial<Category>) => {
    try {
      if (selectedCategory) {
        // Update
        const { error } = await supabase
          .from("categories")
          .update({
            name: item.name,
            slug: item.slug,
            description: item.description,
            image_url: item.image_url
          })
          .eq("id", selectedCategory.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from("categories")
          .insert({
            name: item.name!,
            slug: item.slug!,
            description: item.description,
            image_url: item.image_url
          });
        if (error) throw error;
      }
      setDialogOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      alert("Failed to save category");
    }
  };

  const handleEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setDialogOpen(true);
  };
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (!error) fetchCategories();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-2">Manage your menu categories</p>
        </div>
        <Button onClick={() => { setSelectedCategory(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>
      <Card>
        <CardContent>
          {loading ? (
            <Loader />

          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Name</th>
                  <th className="text-left">Slug</th>
                  <th className="text-left">Description</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.name}</td>
                    <td>{cat.slug}</td>
                    <td>{cat.description}</td>
                    <td>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(cat)} className="mr-2">Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSave={handleSave}
      />
    </div>
  );
} 