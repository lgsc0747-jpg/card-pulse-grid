import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/DesignStudio/ImageUploadField";
import { Switch } from "@/components/ui/switch";
import {
  Plus, Trash2, Edit, Loader2, Package, Eye, EyeOff,
  ShoppingBag,
} from "lucide-react";

interface Product {
  id: string;
  user_id: string;
  persona_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  is_visible: boolean;
  sort_order: number;
}

interface ProductStoreProps {
  personaId: string;
  personaLabel: string;
}

export function ProductStore({ personaId, personaLabel }: ProductStoreProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!user || !personaId) return;
    loadProducts();
  }, [user, personaId]);

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("persona_id", personaId)
      .eq("user_id", user!.id)
      .order("sort_order");
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImageUrl(null);
    setIsVisible(true);
    setEditingProduct(null);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description ?? "");
    setPrice(p.price.toString());
    setStock(p.stock.toString());
    setImageUrl(p.image_url);
    setIsVisible(p.is_visible);
    setDialogOpen(true);
  };

  const openNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !price) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      image_url: imageUrl,
      is_visible: isVisible,
      persona_id: personaId,
      user_id: user!.id,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProduct.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Product updated" });
    } else {
      const { error } = await supabase
        .from("products")
        .insert({ ...payload, sort_order: products.length });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Product added" });
    }

    setSaving(false);
    setDialogOpen(false);
    resetForm();
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    loadProducts();
  };

  const toggleVisibility = async (p: Product) => {
    await supabase.from("products").update({ is_visible: !p.is_visible }).eq("id", p.id);
    loadProducts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Products
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage products for <span className="font-semibold">{personaLabel}</span>
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={openNew}>
              <Plus className="w-4 h-4 mr-1" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="ios-card border-border/60 max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingProduct ? "Edit Product" : "Add Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label>Product Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Premium NFC Card" className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Matte black with gold foil" className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Price (₱)</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="499" className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label>Stock</Label>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="50" className="rounded-xl" />
                </div>
              </div>
              <ImageUploadField
                label="Product Image"
                value={imageUrl}
                onChange={setImageUrl}
                folder="product-images"
              />
              <div className="flex items-center justify-between">
                <Label>Visible to customers</Label>
                <Switch checked={isVisible} onCheckedChange={setIsVisible} />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full gradient-primary text-primary-foreground rounded-xl h-11">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card className="ios-card">
          <CardContent className="p-8 text-center">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No products yet. Add your first product to start selling.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map((p) => (
            <Card key={p.id} className={`ios-card overflow-hidden transition-opacity ${!p.is_visible ? "opacity-60" : ""}`}>
              {p.image_url && (
                <div className="h-32 w-full overflow-hidden">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{p.name}</p>
                    {p.description && <p className="text-[10px] text-muted-foreground">{p.description}</p>}
                  </div>
                  <Badge variant="secondary" className="text-xs font-mono">₱{p.price.toFixed(2)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={p.stock > 0 ? "default" : "destructive"} className="text-[10px]">
                      {p.stock > 0 ? `${p.stock} in stock` : "Sold Out"}
                    </Badge>
                    {!p.is_visible && (
                      <Badge variant="outline" className="text-[10px]">
                        <EyeOff className="w-2.5 h-2.5 mr-1" /> Hidden
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleVisibility(p)}>
                      {p.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
