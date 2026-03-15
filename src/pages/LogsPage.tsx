import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type LogEntry = Tables<"interaction_logs">;

const LogsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ entity_id: "", occasion: "", location: "", card_serial: "", notes: "" });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("interaction_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setLogs(data ?? []);
        setLoading(false);
      });
  }, [user]);

  const openEdit = (log: LogEntry) => {
    setEditingLog(log);
    setFormData({
      entity_id: log.entity_id,
      occasion: log.occasion ?? "",
      location: log.location ?? "",
      card_serial: log.card_serial ?? "",
      notes: log.notes ?? "",
    });
    setIsCreating(false);
  };

  const openCreate = () => {
    setEditingLog(null);
    setFormData({ entity_id: "", occasion: "", location: "", card_serial: "", notes: "" });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!user || !formData.entity_id.trim()) {
      toast({ title: "Validation error", description: "Entity ID is required.", variant: "destructive" });
      return;
    }
    if (isCreating) {
      const { data, error } = await supabase.from("interaction_logs").insert({
        user_id: user.id,
        entity_id: formData.entity_id,
        occasion: formData.occasion || null,
        location: formData.location || null,
        card_serial: formData.card_serial || null,
        notes: formData.notes || null,
      }).select().single();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else if (data) {
        setLogs((prev) => [data, ...prev]);
        toast({ title: "Log created", description: `Entry for ${data.entity_id} added.` });
      }
    } else if (editingLog) {
      const { error } = await supabase.from("interaction_logs").update({
        entity_id: formData.entity_id,
        occasion: formData.occasion || null,
        location: formData.location || null,
        card_serial: formData.card_serial || null,
        notes: formData.notes || null,
      }).eq("id", editingLog.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setLogs((prev) => prev.map((l) => (l.id === editingLog.id ? { ...l, ...formData } : l)));
        toast({ title: "Log updated", description: `Entry saved.` });
      }
    }
    setEditingLog(null);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("interaction_logs").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setLogs((prev) => prev.filter((l) => l.id !== id));
      toast({ title: "Log deleted", description: "Entry removed." });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const dialogOpen = isCreating || editingLog !== null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Interaction Logs</h1>
            <p className="text-sm text-muted-foreground mt-1">Automated ledger of all NFC interactions</p>
          </div>
          <Button onClick={openCreate} className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1.5" /> Add Entry
          </Button>
        </div>

        <div className="glass-card rounded-lg overflow-hidden animate-fade-in">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No interaction logs yet. Logs will appear here as NFC taps are recorded.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Occasion</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">Card</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="group">
                    <TableCell className="font-mono text-xs text-muted-foreground">{formatDate(log.created_at)}</TableCell>
                    <TableCell className="font-medium">{log.entity_id}</TableCell>
                    <TableCell>
                      {log.occasion && <Badge variant="secondary" className="text-xs">{log.occasion}</Badge>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{log.location}</TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{log.card_serial}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(log)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(log.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setEditingLog(null); setIsCreating(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{isCreating ? "Add Log Entry" : "Edit Log Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Entity ID</label>
              <Input value={formData.entity_id} onChange={(e) => setFormData((f) => ({ ...f, entity_id: e.target.value }))} placeholder="e.g. Staff_User_88" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Occasion</label>
              <Input value={formData.occasion} onChange={(e) => setFormData((f) => ({ ...f, occasion: e.target.value }))} placeholder="e.g. Staff Attendance" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Location</label>
              <Input value={formData.location} onChange={(e) => setFormData((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Main Entrance" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Card Serial</label>
              <Input value={formData.card_serial} onChange={(e) => setFormData((f) => ({ ...f, card_serial: e.target.value }))} placeholder="e.g. NFC-0921" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Notes</label>
              <Textarea value={formData.notes} onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingLog(null); setIsCreating(false); }}>Cancel</Button>
            <Button onClick={handleSave} className="gradient-primary text-primary-foreground">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default LogsPage;
