import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploadField } from "@/components/DesignStudio/ImageUploadField";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Video, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  is_video: boolean;
}

interface ProductImageGalleryProps {
  productId: string;
  onImagesChange?: (images: ProductImage[]) => void;
}

export function ProductImageGallery({ productId, onImagesChange }: ProductImageGalleryProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadImages = async () => {
    const { data } = await (supabase as any)
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order");
    const imgs = (data ?? []) as ProductImage[];
    setImages(imgs);
    onImagesChange?.(imgs);
    setLoading(false);
  };

  useEffect(() => {
    if (productId) loadImages();
  }, [productId]);

  const addImage = async (url: string | null, isVideo = false) => {
    if (!url) return;
    setUploading(true);
    await (supabase as any).from("product_images").insert({
      product_id: productId,
      image_url: url,
      sort_order: images.length,
      is_video: isVideo,
    });
    await loadImages();
    setUploading(false);
  };

  const removeImage = async (id: string) => {
    await (supabase as any).from("product_images").delete().eq("id", id);
    await loadImages();
  };

  if (loading) {
    return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Gallery ({images.length}/8)</span>
        {images.length > 0 && (
          <Badge variant="secondary" className="text-[9px]">
            {images.filter((i) => i.is_video).length} videos
          </Badge>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-border/60">
              {img.is_video ? (
                <video src={img.image_url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-white hover:text-destructive"
                  onClick={() => removeImage(img.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              {img.is_video && (
                <div className="absolute top-1 left-1">
                  <Video className="w-3 h-3 text-white drop-shadow" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Controls */}
      {images.length < 8 && (
        <div className="grid grid-cols-2 gap-2">
          <ImageUploadField
            label="Add Image"
            value={null}
            onChange={(url) => addImage(url, false)}
            folder="product-images"
          />
          <ImageUploadField
            label="Add Video"
            value={null}
            onChange={(url) => addImage(url, true)}
            folder="product-images"
          />
        </div>
      )}
    </div>
  );
}
