import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, X, Loader2, History, Trash2 } from "lucide-react";

const RECENT_KEY_PREFIX = "nfc_recent_uploads_";

interface ImageUploadFieldProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
}

export function ImageUploadField({ label, value, onChange, folder }: ImageUploadFieldProps) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [recentUploads, setRecentUploads] = useState<string[]>([]);

  const storageKey = `${RECENT_KEY_PREFIX}${folder}`;

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(stored)) setRecentUploads(stored);
    } catch { /* ignore */ }
  }, [storageKey]);

  const addToRecent = (url: string) => {
    const updated = [url, ...recentUploads.filter((u) => u !== url)].slice(0, 6);
    setRecentUploads(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const removeFromRecent = (url: string) => {
    const updated = recentUploads.filter((u) => u !== url);
    setRecentUploads(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    // If the current value is the one being deleted, clear it
    if (value === url) onChange(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("design-assets").upload(path, file, { upsert: true });
    if (error) {
      console.error("Upload error:", error);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("design-assets").getPublicUrl(path);
    addToRecent(urlData.publicUrl);
    onChange(urlData.publicUrl);
    setUploading(false);
  };

  const otherRecent = recentUploads.filter((u) => u !== value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {otherRecent.length > 0 && (
          <button
            type="button"
            className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            onClick={() => setShowRecent(!showRecent)}
          >
            <History className="w-3 h-3" />
            {showRecent ? "Hide" : "Recent"} ({otherRecent.length})
          </button>
        )}
      </div>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={value} alt={label} className="w-full h-24 object-cover" />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={() => onChange(null)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full h-20 border-dashed flex flex-col gap-1"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span className="text-xs">Upload Image</span>
            </>
          )}
        </Button>
      )}

      {/* Recent uploads gallery */}
      {showRecent && otherRecent.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground">Recent uploads — click to use, hover to delete</p>
          <div className="grid grid-cols-3 gap-1.5">
            {otherRecent.map((url) => (
              <div key={url} className="relative group">
                <button
                  type="button"
                  className="rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all w-full"
                  onClick={() => onChange(url)}
                >
                  <img src={url} alt="Recent upload" className="w-full h-14 object-cover" />
                </button>
                <button
                  type="button"
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); removeFromRecent(url); }}
                  title="Remove from recent"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}
