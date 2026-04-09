import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Video, ChevronLeft, ChevronRight, Upload, Loader2, Image as ImageIcon } from "lucide-react";
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
  const { user } = useAuth();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isVideo: boolean) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/product-images/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("design-assets").upload(path, file, { upsert: true });
    if (error) { console.error("Upload error:", error); setUploading(false); e.target.value = ""; return; }
    const { data: urlData } = supabase.storage.from("design-assets").getPublicUrl(path);

    await (supabase as any).from("product_images").insert({
      product_id: productId,
      image_url: urlData.publicUrl,
      sort_order: images.length,
      is_video: isVideo,
    });
    await loadImages();
    setActiveIndex(images.length); // go to new image
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = async (id: string) => {
    await (supabase as any).from("product_images").delete().eq("id", id);
    setActiveIndex((prev) => Math.max(0, prev - 1));
    await loadImages();
  };

  const goNext = () => setActiveIndex((prev) => Math.min(prev + 1, images.length - 1));
  const goPrev = () => setActiveIndex((prev) => Math.max(prev - 1, 0));

  if (loading) {
    return <div className="flex items-center justify-center h-48"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  const activeImage = images[activeIndex];

  return (
    <div className="space-y-3">
      {/* Main slideshow area */}
      {images.length > 0 ? (
        <div className="relative rounded-xl overflow-hidden border border-border/60 bg-muted/10">
          {/* Main display - 4:5 product aspect ratio */}
          <div className="relative aspect-[4/5] max-h-[420px]">
            {activeImage?.is_video ? (
              <video
                src={activeImage.image_url}
                className="w-full h-full object-contain bg-black/5"
                controls
                muted
              />
            ) : (
              <img
                src={activeImage?.image_url}
                alt="Product"
                className="w-full h-full object-contain"
              />
            )}

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100 shadow-md"
                  onClick={goPrev}
                  disabled={activeIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100 shadow-md"
                  onClick={goNext}
                  disabled={activeIndex === images.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Delete button */}
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-70 hover:opacity-100"
              onClick={() => removeImage(activeImage.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>

            {/* Video badge */}
            {activeImage?.is_video && (
              <Badge variant="secondary" className="absolute top-2 left-2 text-[9px] gap-1">
                <Video className="w-3 h-3" /> Video
              </Badge>
            )}

            {/* Counter */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full">
              {activeIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-[4/5] max-h-[300px] rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center gap-2 bg-muted/10">
          <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">No gallery images yet</p>
        </div>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 px-0.5">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                i === activeIndex ? "border-primary ring-1 ring-primary/30" : "border-border/40 opacity-60 hover:opacity-100"
              )}
            >
              {img.is_video ? (
                <video src={img.image_url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              )}
              {img.is_video && <Video className="absolute top-0.5 left-0.5 w-2.5 h-2.5 text-white drop-shadow" />}
            </button>
          ))}
        </div>
      )}

      {/* Upload controls */}
      {images.length < 8 && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 rounded-xl text-xs gap-1.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Add Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 rounded-xl text-xs gap-1.5"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />}
            Add Video
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, true)} />
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        {images.length}/8 gallery items · Images display at 4:5 ratio on the product page
      </p>
    </div>
  );
}
