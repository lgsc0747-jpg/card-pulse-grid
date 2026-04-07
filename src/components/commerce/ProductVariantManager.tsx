import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string;
  variant_value: string;
  price_modifier: number;
  stock: number;
  image_url: string | null;
  sort_order: number;
}

interface ProductVariantManagerProps {
  productId: string;
}

const VARIANT_TYPES = ["Color", "Size", "Material", "Style"];

export function ProductVariantManager({ productId }: ProductVariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState("Color");
  const [newValue, setNewValue] = useState("");
  const [newPrice, setNewPrice] = useState("0");
  const [newStock, setNewStock] = useState("0");

  const loadVariants = async () => {
    const { data } = await (supabase as any)
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order");
    setVariants((data ?? []) as ProductVariant[]);
    setLoading(false);
  };

  useEffect(() => {
    if (productId) loadVariants();
  }, [productId]);

  const addVariant = async () => {
    if (!newValue.trim()) return;
    setAdding(true);
    await (supabase as any).from("product_variants").insert({
      product_id: productId,
      variant_type: newType,
      variant_value: newValue.trim(),
      price_modifier: parseFloat(newPrice) || 0,
      stock: parseInt(newStock) || 0,
      sort_order: variants.length,
    });
    setNewValue("");
    setNewPrice("0");
    setNewStock("0");
    await loadVariants();
    setAdding(false);
  };

  const removeVariant = async (id: string) => {
    await (supabase as any).from("product_variants").delete().eq("id", id);
    await loadVariants();
  };

  if (loading) return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;

  const grouped = variants.reduce<Record<string, ProductVariant[]>>((acc, v) => {
    (acc[v.variant_type] = acc[v.variant_type] || []).push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <span className="text-xs font-medium">Variants ({variants.length})</span>

      {/* Existing Variants */}
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="space-y-2">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{type}</Label>
          <div className="flex flex-wrap gap-1.5">
            {items.map((v) => (
              <Badge
                key={v.id}
                variant="secondary"
                className="gap-1.5 pr-1 text-xs"
              >
                {v.variant_value}
                {v.price_modifier !== 0 && (
                  <span className="text-[9px] text-muted-foreground">
                    {v.price_modifier > 0 ? "+" : ""}₱{v.price_modifier}
                  </span>
                )}
                <span className="text-[9px] text-muted-foreground">({v.stock})</span>
                <button onClick={() => removeVariant(v.id)} className="hover:text-destructive ml-0.5">
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      ))}

      {/* Add New Variant */}
      <div className="space-y-2 p-3 rounded-xl border border-dashed border-border/60 bg-muted/20">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">Type</Label>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger className="h-8 rounded-lg text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {VARIANT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px]">Value</Label>
            <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="e.g. Red" className="h-8 rounded-lg text-xs" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">Price ±</Label>
            <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="h-8 rounded-lg text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">Stock</Label>
            <Input type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} className="h-8 rounded-lg text-xs" />
          </div>
        </div>
        <Button size="sm" onClick={addVariant} disabled={adding || !newValue.trim()} className="w-full h-8 rounded-lg text-xs">
          {adding ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
          Add Variant
        </Button>
      </div>
    </div>
  );
}
