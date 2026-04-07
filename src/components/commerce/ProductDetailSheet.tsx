import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ShoppingBag, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
}

interface ProductDetailSheetProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  accentColor: string;
  textColor?: string;
}

export function ProductDetailSheet({ product, open, onClose, onAddToCart, accentColor, textColor = "#ffffff" }: ProductDetailSheetProps) {
  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-[2rem] bg-background border-t border-border/60 shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 sticky top-0 z-10">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Close */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-3 right-4 rounded-full h-8 w-8 z-10 bg-background/80 backdrop-blur-sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Product Image — full width, Glossier-style */}
            {product.image_url ? (
              <div className="w-full aspect-[4/3] bg-muted/10 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full aspect-[4/3] bg-muted/10 flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground/20" />
              </div>
            )}

            {/* Product Info */}
            <div className="px-6 pb-8 pt-5 space-y-5">
              {/* Name + Price */}
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-bold tracking-tight">{product.name}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-mono font-bold" style={{ color: accentColor }}>
                    ₱{product.price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                  {product.stock > 0 ? (
                    <Badge variant="secondary" className="text-[10px]">{product.stock} in stock</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px]">Sold Out</Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
                </div>
              )}

              {/* Add to Cart */}
              {product.stock > 0 ? (
                <Button
                  onClick={handleAdd}
                  className="w-full h-14 rounded-2xl text-base font-semibold gap-2"
                  style={{ backgroundColor: accentColor, color: "#fff" }}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Bag · ₱{product.price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </Button>
              ) : (
                <Button disabled className="w-full h-14 rounded-2xl text-base font-semibold">
                  Sold Out
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
