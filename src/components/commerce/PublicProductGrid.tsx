import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Plus } from "lucide-react";
import { CheckoutSheet, type CartItem } from "./CheckoutSheet";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
}

interface PublicProductGridProps {
  personaId: string;
  sellerUserId: string;
  accentColor: string;
  textColor?: string;
  gcashQrUrl?: string | null;
}

export function PublicProductGrid({ personaId, sellerUserId, accentColor, textColor, gcashQrUrl }: PublicProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, description, price, image_url, stock")
      .eq("persona_id", personaId)
      .eq("is_visible", true)
      .order("sort_order")
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, [personaId]);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === p.id);
      if (exists) {
        return prev.map((c) => c.id === p.id ? { ...c, quantity: Math.min(c.quantity + 1, p.stock) } : c);
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, image_url: p.image_url, quantity: 1, stock: p.stock }];
    });
  };

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  if (loading || products.length === 0) return null;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold" style={{ color: textColor }}>Shop</h2>
          {cartCount > 0 && (
            <Button
              size="sm"
              className="rounded-full h-9 px-4 gap-2"
              style={{ backgroundColor: accentColor, color: "#fff" }}
              onClick={() => setCheckoutOpen(true)}
            >
              <ShoppingBag className="w-4 h-4" />
              Cart ({cartCount})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md"
            >
              {p.image_url ? (
                <div className="aspect-square overflow-hidden">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ) : (
                <div className="aspect-square bg-muted/20 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}
              <div className="p-3 space-y-2">
                <p className="text-sm font-semibold truncate" style={{ color: textColor }}>{p.name}</p>
                {p.description && (
                  <p className="text-[10px] leading-tight line-clamp-2" style={{ color: `${textColor ?? "#fff"}99` }}>
                    {p.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-bold" style={{ color: accentColor }}>₱{p.price.toFixed(2)}</span>
                  {p.stock > 0 ? (
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full shadow-lg"
                      style={{ backgroundColor: accentColor, color: "#fff" }}
                      onClick={() => addToCart(p)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Badge variant="destructive" className="text-[9px]">Sold Out</Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <CheckoutSheet
        open={checkoutOpen}
        onClose={() => { setCheckoutOpen(false); setCart([]); }}
        cart={cart}
        onUpdateCart={setCart}
        personaId={personaId}
        sellerUserId={sellerUserId}
        gcashQrUrl={gcashQrUrl}
      />
    </>
  );
}
