import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProductStore } from "@/components/commerce/ProductStore";
import { OrderManagement } from "@/components/commerce/OrderManagement";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadField } from "@/components/DesignStudio/ImageUploadField";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeOverlay } from "@/components/UpgradePrompt";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, ShoppingBag, ClipboardList, QrCode, Save,
} from "lucide-react";

interface PersonaOption {
  id: string;
  label: string;
  gcash_qr_url: string | null;
}

const CommercePage = () => {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const { toast } = useToast();
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [gcashQr, setGcashQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingQr, setSavingQr] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("personas")
      .select("id, label, gcash_qr_url")
      .eq("user_id", user.id)
      .order("created_at")
      .then(({ data }) => {
        const list = (data as PersonaOption[]) ?? [];
        setPersonas(list);
        if (list.length > 0) {
          setSelectedId(list[0].id);
          setGcashQr(list[0].gcash_qr_url);
        }
        setLoading(false);
      });
  }, [user]);

  const handlePersonaChange = (id: string) => {
    setSelectedId(id);
    const p = personas.find((p) => p.id === id);
    setGcashQr(p?.gcash_qr_url ?? null);
  };

  const saveGcashQr = async () => {
    setSavingQr(true);
    await supabase.from("personas").update({ gcash_qr_url: gcashQr } as any).eq("id", selectedId);
    setPersonas(personas.map((p) => p.id === selectedId ? { ...p, gcash_qr_url: gcashQr } : p));
    toast({ title: "GCash QR saved" });
    setSavingQr(false);
  };

  const selected = personas.find((p) => p.id === selectedId);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" /> Commerce
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage products, orders, and payment settings</p>
        </div>
        <Select value={selectedId} onValueChange={handlePersonaChange}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder="Select persona" />
          </SelectTrigger>
          <SelectContent>
            {personas.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid rounded-xl">
          <TabsTrigger value="products" className="text-xs gap-1 rounded-xl">
            <ShoppingBag className="w-3.5 h-3.5" /> Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs gap-1 rounded-xl">
            <ClipboardList className="w-3.5 h-3.5" /> Orders
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs gap-1 rounded-xl">
            <QrCode className="w-3.5 h-3.5" /> Payment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {selectedId && selected && (
            <ProductStore personaId={selectedId} personaLabel={selected.label} />
          )}
        </TabsContent>

        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>

        <TabsContent value="payment">
          <Card className="ios-card max-w-md">
            <CardHeader>
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <QrCode className="w-4 h-4" /> GCash QR Code
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">
                Upload your GCash QR code image. Customers will see this during checkout.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUploadField
                label="GCash QR Image"
                value={gcashQr}
                onChange={setGcashQr}
                folder="gcash-qr"
              />
              <Button onClick={saveGcashQr} disabled={savingQr} className="w-full gradient-primary text-primary-foreground rounded-xl">
                {savingQr ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                Save QR Code
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <DashboardLayout>
      {isPro ? content : (
        <UpgradeOverlay feature="Commerce Suite" description="Upgrade to Pro to sell products, manage orders, and accept payments.">
          {content}
        </UpgradeOverlay>
      )}
    </DashboardLayout>
  );
};

export default CommercePage;
