import { useState, useEffect, useRef, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  CreditCard, Loader2, Plus, Trash2, Pencil, X, Check, Wifi, Smartphone,
  Keyboard, ChevronLeft, AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { getNfcSupport, readNfcSerial } from "@/lib/webNfc";
import type { Tables } from "@/integrations/supabase/types";

type NfcCard = Tables<"nfc_cards"> & { persona_id: string | null };
type Persona = Pick<Tables<"personas">, "id" | "label" | "accent_color" | "slug">;

type WizardStep = "read" | "details" | "confirm";

const CardsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Data
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  // Wizard
  const [showAdd, setShowAdd] = useState(false);
  const [step, setStep] = useState<WizardStep>("read");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [serial, setSerial] = useState("");
  const [label, setLabel] = useState("");
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const scanAbortRef = useRef<AbortController | null>(null);

  // Inline edits on existing cards
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editSerial, setEditSerial] = useState("");
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);

  const nfcSupport = useMemo(() => getNfcSupport(), []);

  const fetchData = async () => {
    if (!user) return;
    const [cardsRes, personasRes] = await Promise.all([
      supabase.from("nfc_cards").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("personas").select("id, label, accent_color, slug").eq("user_id", user.id).order("created_at"),
    ]);
    setCards((cardsRes.data ?? []) as NfcCard[]);
    setPersonas((personasRes.data ?? []) as Persona[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  // ── Wizard helpers ────────────────────────────────────────────────────
  const resetWizard = () => {
    scanAbortRef.current?.abort();
    scanAbortRef.current = null;
    setStep("read");
    setScanning(false);
    setScanError(null);
    setManualMode(false);
    setSerial("");
    setLabel("");
    setPersonaId(personas.find((p) => true)?.id ?? null);
    setRegistering(false);
  };

  const openWizard = () => {
    resetWizard();
    // pre-select active persona if any
    setPersonaId(personas[0]?.id ?? null);
    setShowAdd(true);
  };

  const closeWizard = (open: boolean) => {
    if (!open) {
      scanAbortRef.current?.abort();
      scanAbortRef.current = null;
    }
    setShowAdd(open);
  };

  const startScan = async () => {
    if (nfcSupport === "unsupported") {
      setManualMode(true);
      return;
    }
    setScanning(true);
    setScanError(null);
    const ac = new AbortController();
    scanAbortRef.current = ac;
    try {
      const { serialNumber } = await readNfcSerial(ac.signal);
      setSerial(serialNumber);
      setScanning(false);
      setStep("details");
    } catch (err: any) {
      setScanning(false);
      const code = err?.message ?? "nfc_read_error";
      if (code === "nfc_aborted") return;
      const messages: Record<string, string> = {
        nfc_unsupported: "Your browser doesn't support NFC reading.",
        nfc_no_serial: "Card detected but no serial returned. Try again.",
        nfc_read_error: "Couldn't read the card. Try again or enter the serial manually.",
      };
      setScanError(messages[code] ?? "Couldn't read the card. Try again.");
    }
  };

  const submitManualSerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) return;
    setStep("details");
  };

  const advanceToConfirm = () => {
    if (!serial.trim() || !personaId) return;
    setStep("confirm");
  };

  const registerCard = async () => {
    if (!user || !serial.trim() || !personaId) return;
    setRegistering(true);

    // Insert card
    const { data: card, error: cardErr } = await supabase
      .from("nfc_cards")
      .insert({
        user_id: user.id,
        serial_number: serial.trim(),
        label: label.trim() || null,
        persona_id: personaId,
      })
      .select()
      .single();

    if (cardErr || !card) {
      toast({ title: "Couldn't register card", description: cardErr?.message ?? "Unknown error", variant: "destructive" });
      setRegistering(false);
      return;
    }

    // Create a per-card short link automatically
    const code = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    await supabase.from("short_links").insert({
      user_id: user.id,
      code,
      persona_id: personaId,
      card_id: card.id,
    });

    setCards((prev) => [card as NfcCard, ...prev]);
    toast({ title: "Card registered", description: card.serial_number });
    setRegistering(false);
    setShowAdd(false);
    resetWizard();
  };

  // ── Existing card edits ──────────────────────────────────────────────
  const updateCard = async (id: string, updates: Partial<NfcCard>) => {
    const { error } = await supabase.from("nfc_cards").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    }
  };

  const deleteCard = async (id: string) => {
    const { error } = await supabase.from("nfc_cards").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCards((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Card removed" });
    }
    setDeleteCardId(null);
  };

  const startEditing = (card: NfcCard) => {
    setEditingCardId(card.id);
    setEditLabel(card.label ?? "");
    setEditSerial(card.serial_number);
  };

  const saveEdit = async () => {
    if (!editingCardId) return;
    await updateCard(editingCardId, {
      label: editLabel.trim() || null,
      serial_number: editSerial.trim(),
    });
    setEditingCardId(null);
  };

  const timeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const personaById = (id: string | null) => personas.find((p) => p.id === id);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const noPersonas = personas.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">NFC Cards</h1>
            <p className="text-sm text-muted-foreground mt-1">Register physical NFC tags and pin each one to a persona</p>
          </div>
          <Button onClick={openWizard} className="gradient-primary text-primary-foreground" disabled={noPersonas}>
            <Plus className="w-4 h-4 mr-1.5" /> Register Card
          </Button>
        </div>

        {noPersonas && (
          <div className="glass-card rounded-2xl p-4 flex items-start gap-3 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Create at least one persona before registering a card — every card must point to a persona.
            </p>
          </div>
        )}

        {cards.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
            <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No NFC cards registered yet. Tap a card to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cards.map((card, i) => {
              const persona = personaById(card.persona_id);
              return (
                <Card key={card.id} className="glass-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          {editingCardId === card.id ? (
                            <div className="space-y-1">
                              <Input value={editSerial} onChange={(e) => setEditSerial(e.target.value)} className="h-7 text-sm font-mono w-36" placeholder="Serial" />
                              <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="h-7 text-xs w-36" placeholder="Label" />
                            </div>
                          ) : (
                            <>
                              <CardTitle className="text-sm font-mono">{card.serial_number}</CardTitle>
                              {card.label && <p className="text-xs text-muted-foreground">{card.label}</p>}
                              <p className="text-[10px] text-muted-foreground">Updated {timeSince(card.updated_at)}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {editingCardId === card.id ? (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEdit}>
                              <Check className="w-3.5 h-3.5 text-primary" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingCardId(null)}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEditing(card)}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => setDeleteCardId(card.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        <Badge variant={card.status === "active" ? "default" : "secondary"} className="text-[10px] ml-1">
                          {card.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Switch
                        checked={card.status === "active"}
                        onCheckedChange={(active) => updateCard(card.id, { status: active ? "active" : "inactive" })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">Persona</label>
                      <Select
                        value={card.persona_id ?? ""}
                        onValueChange={(val) => updateCard(card.id, { persona_id: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pick a persona">
                            {persona && (
                              <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: persona.accent_color ?? "#14b8a6" }} />
                                {persona.label}
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {personas.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.accent_color ?? "#14b8a6" }} />
                                {p.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Registration wizard ─────────────────────────────────────── */}
      <Dialog open={showAdd} onOpenChange={closeWizard}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              {step !== "read" && (
                <button
                  type="button"
                  onClick={() => setStep(step === "confirm" ? "details" : "read")}
                  className="p-1 -ml-1 rounded-md hover:bg-muted transition-colors"
                  aria-label="Back"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {step === "read" && "Tap your card"}
              {step === "details" && "Name & persona"}
              {step === "confirm" && "Register card"}
            </DialogTitle>
          </DialogHeader>

          {/* Stepper */}
          <div className="flex items-center gap-1.5 px-1 -mt-1 mb-1">
            {(["read", "details", "confirm"] as WizardStep[]).map((s) => {
              const idx = ["read", "details", "confirm"].indexOf(s);
              const cur = ["read", "details", "confirm"].indexOf(step);
              return (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${idx <= cur ? "bg-primary" : "bg-muted"}`}
                />
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {step === "read" && (
              <motion.div
                key="read"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 py-2"
              >
                {!manualMode ? (
                  <>
                    <div className="rounded-2xl bg-muted/40 border border-border p-6 flex flex-col items-center gap-4 text-center">
                      <div className="relative w-20 h-20">
                        <div className={`absolute inset-0 rounded-full border-2 border-primary/40 ${scanning ? "animate-ping" : ""}`} />
                        <div className="absolute inset-0 rounded-full bg-primary/10 flex items-center justify-center">
                          <Smartphone className="w-9 h-9 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {scanning ? "Hold the card to your phone" : "Ready to read"}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          {nfcSupport === "supported"
                            ? "Bring an unregistered NFC card close to your device. We'll detect its serial automatically."
                            : "Your browser can't read NFC. Use Android Chrome, or enter the serial manually."}
                        </p>
                      </div>
                      {scanError && (
                        <p className="text-xs text-destructive">{scanError}</p>
                      )}
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {nfcSupport === "supported" && (
                          <Button
                            onClick={startScan}
                            disabled={scanning}
                            className="gradient-primary text-primary-foreground"
                          >
                            {scanning ? (
                              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Listening…</>
                            ) : (
                              <><Wifi className="w-3.5 h-3.5 mr-1.5" /> Start scan</>
                            )}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setManualMode(true)}>
                          <Keyboard className="w-3.5 h-3.5 mr-1.5" /> Type serial
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <form onSubmit={submitManualSerial} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">Serial number</label>
                      <Input
                        value={serial}
                        onChange={(e) => setSerial(e.target.value)}
                        placeholder="e.g. 04:A2:9F:B1:C3:00"
                        autoFocus
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">Found on the card itself or the original packaging.</p>
                    </div>
                    <div className="flex justify-between gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => { setManualMode(false); setSerial(""); }}>
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back to scan
                      </Button>
                      <Button type="submit" disabled={!serial.trim()} className="gradient-primary text-primary-foreground">
                        Continue
                      </Button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 py-2"
              >
                <div className="rounded-xl bg-muted/40 border border-border px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Serial</span>
                  <span className="text-xs font-mono">{serial}</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-muted-foreground">Card name</label>
                  <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Conference Card" autoFocus />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-muted-foreground">Persona</label>
                  <Select value={personaId ?? ""} onValueChange={setPersonaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.accent_color ?? "#14b8a6" }} />
                            {p.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">This card will always link to this persona — even if your active persona changes.</p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={advanceToConfirm} disabled={!personaId} className="gradient-primary text-primary-foreground">
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 py-2"
              >
                <div className="rounded-2xl bg-muted/40 border border-border p-4 space-y-3">
                  <Row label="Serial" value={<span className="font-mono">{serial}</span>} />
                  <Row label="Name" value={label || <span className="text-muted-foreground italic">No name</span>} />
                  <Row
                    label="Persona"
                    value={
                      personaId ? (() => {
                        const p = personaById(personaId);
                        return (
                          <span className="flex items-center gap-2 justify-end">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p?.accent_color ?? "#14b8a6" }} />
                            {p?.label}
                          </span>
                        );
                      })() : <span className="text-destructive">Not selected</span>
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={registerCard} disabled={registering || !personaId} className="gradient-primary text-primary-foreground">
                    {registering ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                    Register card
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteCardId}
        onOpenChange={(open) => !open && setDeleteCardId(null)}
        title="Delete NFC Card"
        description="This will permanently remove this card and its short link. This action cannot be undone."
        onConfirm={() => deleteCardId && deleteCard(deleteCardId)}
        variant="destructive"
      />
    </DashboardLayout>
  );
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export default CardsPage;
