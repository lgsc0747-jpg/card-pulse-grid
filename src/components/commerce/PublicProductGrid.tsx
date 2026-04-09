import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Plus, Package } from "lucide-react";
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
  selectedProductIds?: string[];
}

export function PublicProductGrid({ personaId, sellerUserId, accentColor, textColor, gcashQrUrl, selectedProductIds }: PublicProductGridProps) {
  const navigate = useNavigate();
  const location = useLocation();
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
        let list = (data as Product[]) ?? [];
        if (selectedProductIds && selectedProductIds.length > 0) {
          list = list.filter(p => selectedProductIds.includes(p.id));
        }
        setProducts(list);
        setLoading(false);
      });
  }, [personaId, selectedProductIds?.join(",")]);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === p.id);
      if (exists) {
        return prev.map((c) => c.id === p.id ? { ...c, quantity: Math.min(c.quantity + 1, p.stock) } : c);
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, image_url: p.image_url, quantity: 1, stock: p.stock }];
    });
  };

  const openProductPage = (p: Product) => {
    // Navigate to dedicated product page
    const basePath = location.pathname.replace(/\/+$/, "");
    navigate(`${basePath}/product/${p.id}`);
  };

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  if (loading || products.length === 0) return null;

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold" style={{ color: textColor }}>Shop</h2>
          {cartCount > 0 && (
            <Button size="sm" className="rounded-full h-9 px-4 gap-2 shadow-lg" style={{ backgroundColor: accentColor, color: "#fff" }} onClick={() => setCheckoutOpen(true)}>
              <ShoppingBag className="w-4 h-4" /> Cart ({cartCount})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {products.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openProductPage(p)}
              className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md text-left group"
            >
              {p.image_url ? (
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
              ) : (
                <div className="aspect-[4/5] bg-muted/20 flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}
              <div className="p-3 space-y-1.5">
                <p className="text-sm font-semibold truncate" style={{ color: textColor }}>{p.name}</p>
                {p.description && <p className="text-[10px] leading-tight line-clamp-2" style={{ color: `${textColor ?? "#fff"}80` }}>{p.description}</p>}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-mono font-bold" style={{ color: accentColor }}>₱{p.price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                  {p.stock > 0 ? (
                    <div className="h-7 w-7 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: accentColor }} onClick={(e) => { e.stopPropagation(); addToCart(p); }}>
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : (
                    <Badge variant="destructive" className="text-[9px]">Sold Out</Badge>
                  )}
                </div>
              </div>
            </motion.button>
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
