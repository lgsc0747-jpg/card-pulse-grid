import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";

interface VariantImage {
  id: string;
  variant_id: string;
  image_url: string;
  sort_order: number;
}

interface VariantImageGalleryProps {
  variantId: string;
}

export function VariantImageGallery({ variantId }: VariantImageGalleryProps) {
  const { user } = useAuth();
  const [images, setImages] = useState<VariantImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = async () => {
    const { data } = await (supabase as any)
      .from("product_variant_images")
      .select("*")
      .eq("variant_id", variantId)
      .order("sort_order");
    setImages((data ?? []) as VariantImage[]);
    setLoading(false);
  };

  useEffect(() => {
    loadImages();
  }, [variantId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/variant-images/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("design-assets").upload(path, file, { upsert: true });
    if (error) { setUploading(false); e.target.value = ""; return; }
    const { data: urlData } = supabase.storage.from("design-assets").getPublicUrl(path);

    await (supabase as any).from("product_variant_images").insert({
      variant_id: variantId,
      image_url: urlData.publicUrl,
      sort_order: images.length,
    });
    await loadImages();
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = async (id: string) => {
    await (supabase as any).from("product_variant_images").delete().eq("id", id);
    await loadImages();
  };

  if (loading) return <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-2 pt-2 border-t border-border/30">
      <div className="flex flex-wrap gap-1.5">
        {images.map((img) => (
          <div key={img.id} className="relative w-12 h-12 rounded-lg overflow-hidden border border-border/40 group">
            <img src={img.image_url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(img.id)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Trash2 className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        {images.length < 5 && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-12 h-12 rounded-lg border-2 border-dashed border-border/40 flex items-center justify-center hover:border-primary/40 transition-colors"
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 text-muted-foreground" />}
          </button>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <p className="text-[9px] text-muted-foreground">{images.length}/5 variant images</p>
    </div>
  );
}
