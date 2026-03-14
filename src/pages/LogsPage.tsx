import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogEntry {
  id: string;
  timestamp: string;
  entityId: string;
  occasion: string;
  location: string;
  cardSerial: string;
}

const occasions = ["Staff Attendance", "IT Asset Tracking", "Event Check-in", "Security Access", "Guest WiFi Access"];

const initialLogs: LogEntry[] = [
  { id: "1", timestamp: "2026-03-14 10:15", entityId: "Staff_User_88", occasion: "Staff Attendance", location: "Main Entrance", cardSerial: "NFC-0921" },
  { id: "2", timestamp: "2026-03-14 09:42", entityId: "Asset_Laptop_04", occasion: "IT Asset Tracking", location: "Server Room", cardSerial: "NFC-1044" },
  { id: "3", timestamp: "2026-03-14 09:10", entityId: "Guest_Visitor_12", occasion: "Event Check-in", location: "Lobby", cardSerial: "NFC-0877" },
  { id: "4", timestamp: "2026-03-14 08:30", entityId: "Staff_User_22", occasion: "Security Access", location: "Lab B", cardSerial: "NFC-1122" },
  { id: "5", timestamp: "2026-03-13 17:45", entityId: "Asset_Badge_09", occasion: "Staff Attendance", location: "Exit Gate", cardSerial: "NFC-0633" },
  { id: "6", timestamp: "2026-03-13 16:20", entityId: "Guest_Visitor_05", occasion: "Guest WiFi Access", location: "Meeting Room 3", cardSerial: "NFC-0877" },
];

const emptyLog: Omit<LogEntry, "id"> = {
  timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
  entityId: "",
  occasion: occasions[0],
  location: "",
  cardSerial: "",
};

const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<LogEntry, "id">>(emptyLog);
  const { toast } = useToast();

  const openEdit = (log: LogEntry) => {
    setEditingLog(log);
    setFormData({ timestamp: log.timestamp, entityId: log.entityId, occasion: log.occasion, location: log.location, cardSerial: log.cardSerial });
    setIsCreating(false);
  };

  const openCreate = () => {
    setEditingLog(null);
    setFormData({ ...emptyLog, timestamp: new Date().toISOString().slice(0, 16).replace("T", " ") });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!formData.entityId.trim()) {
      toast({ title: "Validation error", description: "Entity ID is required.", variant: "destructive" });
      return;
    }
    if (isCreating) {
      const newLog: LogEntry = { ...formData, id: crypto.randomUUID() };
      setLogs((prev) => [newLog, ...prev]);
      toast({ title: "Log created", description: `Entry for ${formData.entityId} added.` });
    } else if (editingLog) {
      setLogs((prev) => prev.map((l) => (l.id === editingLog.id ? { ...l, ...formData } : l)));
      toast({ title: "Log updated", description: `Entry for ${formData.entityId} saved.` });
    }
    setEditingLog(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    toast({ title: "Log deleted", description: "Interaction log entry removed." });
  };

  const dialogOpen = isCreating || editingLog !== null;

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Occasion</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden md:table-cell">Card</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="group">
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.entityId}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{log.occasion}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{log.location}</TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{log.cardSerial}</TableCell>
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
              <Input value={formData.entityId} onChange={(e) => setFormData((f) => ({ ...f, entityId: e.target.value }))} placeholder="e.g. Staff_User_88" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Occasion</label>
              <Select value={formData.occasion} onValueChange={(occasion) => setFormData((f) => ({ ...f, occasion }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {occasions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Location</label>
              <Input value={formData.location} onChange={(e) => setFormData((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Main Entrance" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Card Serial</label>
              <Input value={formData.cardSerial} onChange={(e) => setFormData((f) => ({ ...f, cardSerial: e.target.value }))} placeholder="e.g. NFC-0921" />
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
