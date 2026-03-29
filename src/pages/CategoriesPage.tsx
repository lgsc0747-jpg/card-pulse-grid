import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Category = Tables<"categories">;

const PRESET_COLORS = [
  "#14b8a6", "#0ea5e9", "#8b5cf6", "#f59e0b",
  "#ef4444", "#22c55e", "#ec4899", "#6366f1",
];

const CategoriesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCategories(data ?? []);
        setLoading(false);
      });
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    setLabel("");
    setColor(PRESET_COLORS[0]);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setLabel(cat.label);
    setColor(cat.color ?? PRESET_COLORS[0]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !label.trim()) return;
    if (editing) {
      const { error } = await supabase
        .from("categories")
        .update({ label: label.trim(), color })
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setCategories((prev) =>
          prev.map((c) => (c.id === editing.id ? { ...c, label: label.trim(), color } : c))
        );
        toast({ title: "Category updated" });
      }
    } else {
      const { data, error } = await supabase
        .from("categories")
        .insert({ label: label.trim(), color, user_id: user.id })
        .select()
        .single();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else if (data) {
        setCategories((prev) => [data, ...prev]);
        toast({ title: "Category created" });
      }
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Category deleted" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Categories</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage occasion types for your NFC interactions
            </p>
          </div>
          <Button onClick={openCreate} className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1.5" /> New Category
          </Button>
        </div>

        {categories.length === 0 ? (
          <div className="glass-card rounded-lg p-12 text-center animate-fade-in">
            <Tag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No categories yet. Create your first occasion type to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <Card
                key={cat.id}
                className="glass-card animate-fade-in group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color ?? "#14b8a6" }}
                    />
                    <span className="font-medium">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(cat)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Label</label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Networking Event"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full transition-all"
                    style={{
                      backgroundColor: c,
                      outline: color === c ? "2px solid hsl(var(--ring))" : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CategoriesPage;
