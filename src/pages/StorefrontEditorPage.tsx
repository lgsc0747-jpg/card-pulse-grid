import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeOverlay } from "@/components/UpgradePrompt";
import { supabase } from "@/integrations/supabase/client";
import { ProductStore } from "@/components/commerce/ProductStore";
import { OrderManagement } from "@/components/commerce/OrderManagement";
import { ImageUploadField } from "@/components/DesignStudio/ImageUploadField";
import { PublicProductGrid } from "@/components/commerce/PublicProductGrid";
import { cn } from "@/lib/utils";
import {
  Loader2, Monitor, Smartphone, Save, Eye,
  ShoppingBag, ClipboardList, QrCode, Layout, X,
  Palette, Type, Image as ImageIcon,
} from "lucide-react";

type Panel = "products" | "orders" | "payment" | null;

interface PersonaBasic {
  id: string;
  slug: string;
  label: string;
  user_id: string;
  accent_color: string | null;
  text_color: string | null;
  landing_bg_color: string | null;
  background_image_url: string | null;
  background_preset: string | null;
  gcash_qr_url?: string | null;
  display_name: string | null;
}

const StorefrontEditorPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPro } = useSubscription();
  const [personas, setPersonas] = useState<PersonaBasic[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("mobile");
  const [gcashQr, setGcashQr] = useState<string | null>(null);
  const [savingQr, setSavingQr] = useState(false);
  const [editingElement, setEditingElement] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("personas")
      .select("id, slug, label, user_id, accent_color, text_color, landing_bg_color, background_image_url, background_preset, gcash_qr_url, display_name")
      .eq("user_id", user.id)
      .order("created_at")
      .then(({ data }) => {
        const list = (data as PersonaBasic[]) ?? [];
        setPersonas(list);
        if (list.length > 0) {
          setSelectedId(list[0].id);
          setGcashQr(list[0].gcash_qr_url ?? null);
        }
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    const p = personas.find((p) => p.id === selectedId);
    if (p) setGcashQr(p.gcash_qr_url ?? null);
  }, [selectedId, personas]);

  const saveGcashQr = async () => {
    if (!selectedId) return;
    setSavingQr(true);
    await supabase.from("personas").update({ gcash_qr_url: gcashQr } as any).eq("id", selectedId);
    toast({ title: "GCash QR saved" });
    setSavingQr(false);
  };

  const selected = personas.find((p) => p.id === selectedId);
  const accentColor = selected?.accent_color ?? "#0d9488";
  const textColor = selected?.text_color ?? "#ffffff";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isPro) {
    return (
      <DashboardLayout>
        <UpgradeOverlay feature="Storefront Editor" description="Upgrade to Pro to build your personal storefront.">
          <div className="h-96" />
        </UpgradeOverlay>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-display font-bold">Storefront</h1>
            <Select value={selectedId ?? ""} onValueChange={setSelectedId}>
              <SelectTrigger className="w-44 rounded-xl h-9 text-xs">
                <SelectValue placeholder="Select persona" />
              </SelectTrigger>
              <SelectContent>
                {personas.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
              <Button size="sm" variant={deviceMode === "desktop" ? "default" : "ghost"} className="h-7 w-7 p-0" onClick={() => setDeviceMode("desktop")}>
                <Monitor className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant={deviceMode === "mobile" ? "default" : "ghost"} className="h-7 w-7 p-0" onClick={() => setDeviceMode("mobile")}>
                <Smartphone className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Layout */}
        <div className="flex gap-0 rounded-2xl border border-border/60 bg-card/30 backdrop-blur-sm overflow-hidden" style={{ minHeight: "calc(100vh - 180px)" }}>
          {/* Quick-access sidebar */}
          <nav className="w-14 shrink-0 border-r border-border/40 bg-card/50 flex flex-col items-center py-4 gap-2">
            {[
              { id: "products" as Panel, icon: ShoppingBag, label: "Products" },
              { id: "orders" as Panel, icon: ClipboardList, label: "Orders" },
              { id: "payment" as Panel, icon: QrCode, label: "Payment" },
            ].map((item) => {
              const Icon = item.icon;
              const active = activePanel === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePanel(active ? null : item.id)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </nav>

          {/* Side Panel (slides in) */}
          {activePanel && (
            <div className="w-80 shrink-0 border-r border-border/40 bg-card/60 backdrop-blur-sm overflow-y-auto animate-slide-in-right">
              <div className="flex items-center justify-between p-4 border-b border-border/40">
                <span className="text-sm font-semibold capitalize">{activePanel}</span>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setActivePanel(null)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="p-4">
                {activePanel === "products" && selectedId && selected && (
                  <ProductStore personaId={selectedId} personaLabel={selected.label} />
                )}
                {activePanel === "orders" && <OrderManagement />}
                {activePanel === "payment" && (
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">GCash QR Code</h3>
                    <ImageUploadField label="GCash QR Image" value={gcashQr} onChange={setGcashQr} folder="gcash-qr" />
                    <Button onClick={saveGcashQr} disabled={savingQr} className="w-full gradient-primary text-primary-foreground rounded-xl h-11">
                      {savingQr ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                      Save QR Code
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Live Preview (click-to-edit) */}
          <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto bg-background/50">
            <div
              className={cn(
                "relative rounded-2xl border border-border/60 overflow-hidden transition-all duration-300",
                deviceMode === "mobile"
                  ? "w-[375px] min-h-[700px] border-[6px] border-muted-foreground/15 rounded-[2.5rem]"
                  : "w-full max-w-4xl min-h-[600px]"
              )}
              style={{
                backgroundColor: selected?.landing_bg_color ?? "hsl(var(--background))",
                backgroundImage: selected?.background_image_url ? `url(${selected.background_image_url})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Storefront Header - Click to edit */}
              <div
                className={cn(
                  "relative p-6 cursor-pointer transition-all",
                  editingElement === "header" && "ring-2 ring-primary ring-inset rounded-t-2xl"
                )}
                onClick={() => setEditingElement(editingElement === "header" ? null : "header")}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: `linear-gradient(180deg, ${accentColor}20, transparent)` }}
                />
                <div className="relative space-y-1.5">
                  <h1
                    className="text-xl font-display font-bold"
                    style={{ color: textColor }}
                  >
                    {selected?.display_name ?? "Your Store"}
                  </h1>
                  <p className="text-xs" style={{ color: `${textColor}80` }}>
                    Tap any section to customize it
                  </p>
                </div>
                {editingElement === "header" && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[9px] px-2 py-0.5 rounded-full font-medium">
                    Editing
                  </div>
                )}
              </div>

              {/* Product Grid - Click to edit */}
              <div
                className={cn(
                  "relative p-4 cursor-pointer transition-all",
                  editingElement === "products" && "ring-2 ring-primary ring-inset"
                )}
                onClick={() => {
                  setEditingElement("products");
                  setActivePanel("products");
                }}
              >
                {selectedId && user && (
                  <PublicProductGrid
                    personaId={selectedId}
                    sellerUserId={user.id}
                    accentColor={accentColor}
                    textColor={textColor}
                    gcashQrUrl={gcashQr}
                  />
                )}
                {editingElement === "products" && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[9px] px-2 py-0.5 rounded-full font-medium z-10">
                    Editing Products
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StorefrontEditorPage;
