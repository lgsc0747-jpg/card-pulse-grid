import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Open command palette" },
  { keys: ["⌘", "/"], label: "Show keyboard shortcuts" },
  { keys: ["G", "D"], label: "Go to Dashboard" },
  { keys: ["G", "P"], label: "Go to Personas" },
  { keys: ["G", "L"], label: "Go to Leads" },
  { keys: ["G", "F"], label: "Go to Funnel" },
  { keys: ["G", "N"], label: "Go to NFC Manager" },
  { keys: ["G", "S"], label: "Go to Settings" },
  { keys: ["?"], label: "Show this help" },
];

export function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false);
  const [lastG, setLastG] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }

      // 'g' then route key shortcut
      if (e.key === "g" || e.key === "G") {
        setLastG(Date.now());
        return;
      }
      if (Date.now() - lastG < 1200) {
        const map: Record<string, string> = {
          d: "/", p: "/personas", l: "/leads", f: "/funnel", n: "/nfc-manager", s: "/settings",
        };
        const path = map[e.key.toLowerCase()];
        if (path) {
          e.preventDefault();
          window.location.assign(path);
          setLastG(0);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lastG]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>Move faster across Handshake.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {SHORTCUTS.map((s) => (
            <div key={s.label} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
              <span className="text-muted-foreground">{s.label}</span>
              <div className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} className="px-2 py-0.5 rounded bg-muted text-xs font-mono">{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
