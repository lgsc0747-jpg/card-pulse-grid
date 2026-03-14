import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "conference", label: "Conference Check-in" },
  { id: "asset", label: "IT Asset Tracking" },
  { id: "wifi", label: "Guest WiFi Access" },
  { id: "attendance", label: "Staff Attendance" },
  { id: "security", label: "Security Access" },
];

interface NfcCard {
  id: string;
  serial: string;
  active: boolean;
  categoryId: string;
  lastSeen: string;
}

const initialCards: NfcCard[] = [
  { id: "1", serial: "NFC-0921-A3F2", active: true, categoryId: "attendance", lastSeen: "2 min ago" },
  { id: "2", serial: "NFC-1044-B7C1", active: true, categoryId: "asset", lastSeen: "18 min ago" },
  { id: "3", serial: "NFC-0877-D9E4", active: true, categoryId: "conference", lastSeen: "1 hr ago" },
  { id: "4", serial: "NFC-1122-F5A8", active: false, categoryId: "security", lastSeen: "3 days ago" },
  { id: "5", serial: "NFC-0633-C2B9", active: false, categoryId: "wifi", lastSeen: "1 week ago" },
];

const CardsPage = () => {
  const [cards, setCards] = useState<NfcCard[]>(initialCards);
  const { toast } = useToast();

  const updateCard = (id: string, updates: Partial<NfcCard>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleSave = (card: NfcCard) => {
    toast({
      title: "Configuration saved",
      description: `Card ${card.serial} updated successfully.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">NFC Cards</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your physical NFC tags and their assigned categories</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <Card key={card.id} className="glass-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-mono">{card.serial}</CardTitle>
                      <p className="text-xs text-muted-foreground">Last seen: {card.lastSeen}</p>
                    </div>
                  </div>
                  <Badge variant={card.active ? "default" : "secondary"} className="text-[10px]">
                    {card.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Switch
                    checked={card.active}
                    onCheckedChange={(active) => updateCard(card.id, { active })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-muted-foreground">Current Purpose</label>
                  <Select
                    value={card.categoryId}
                    onValueChange={(categoryId) => updateCard(card.id, { categoryId })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  className="w-full gradient-primary text-primary-foreground"
                  onClick={() => handleSave(card)}
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CardsPage;
