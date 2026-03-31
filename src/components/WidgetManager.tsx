import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Zap, Users, Smartphone, MapPin, Eye, FileText, CreditCard,
  Settings2, X,
} from "lucide-react";

interface WidgetManagerProps {
  stats: {
    totalTaps: number;
    uniqueVisitors: number;
    topDevice: string;
    topLocation: string;
    profileViews: number;
    cvDownloads: number;
    vcardDownloads: number;
  };
}

type WidgetKey = "totalTaps" | "uniqueVisitors" | "topDevice" | "topLocation" | "profileViews" | "cvDownloads";

const WIDGET_CONFIG: { key: WidgetKey; label: string; icon: React.ReactNode }[] = [
  { key: "totalTaps", label: "Total Taps", icon: <Zap className="w-4 h-4" /> },
  { key: "uniqueVisitors", label: "Unique Visitors", icon: <Users className="w-4 h-4" /> },
  { key: "topDevice", label: "Top Device", icon: <Smartphone className="w-4 h-4" /> },
  { key: "topLocation", label: "Top Location", icon: <MapPin className="w-4 h-4" /> },
  { key: "profileViews", label: "Profile Views", icon: <Eye className="w-4 h-4" /> },
  { key: "cvDownloads", label: "CV Downloads", icon: <FileText className="w-4 h-4" /> },
];

export function WidgetManager({ stats }: WidgetManagerProps) {
  const [editMode, setEditMode] = useState(false);
  const [visible, setVisible] = useState<Record<WidgetKey, boolean>>({
    totalTaps: true,
    uniqueVisitors: true,
    topDevice: true,
    topLocation: true,
    profileViews: true,
    cvDownloads: true,
  });

  const getValue = (key: WidgetKey): string => {
    switch (key) {
      case "totalTaps": return stats.totalTaps.toLocaleString();
      case "uniqueVisitors": return stats.uniqueVisitors.toLocaleString();
      case "topDevice": return stats.topDevice;
      case "topLocation": return stats.topLocation;
      case "profileViews": return stats.profileViews.toLocaleString();
      case "cvDownloads": return stats.cvDownloads.toLocaleString();
    }
  };

  const activeWidgets = WIDGET_CONFIG.filter((w) => visible[w.key]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-sm">Metrics</h2>
        <Button
          size="sm"
          variant={editMode ? "default" : "outline"}
          className={editMode ? "gradient-primary text-primary-foreground h-7 text-xs" : "h-7 text-xs"}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? <X className="w-3 h-3 mr-1" /> : <Settings2 className="w-3 h-3 mr-1" />}
          {editMode ? "Done" : "Edit"}
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {editMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-lg p-3 space-y-2 overflow-hidden"
          >
            {WIDGET_CONFIG.map((w) => (
              <div key={w.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {w.icon}
                  <span>{w.label}</span>
                </div>
                <Switch
                  checked={visible[w.key]}
                  onCheckedChange={(checked) =>
                    setVisible((v) => ({ ...v, [w.key]: checked }))
                  }
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {activeWidgets.map((w) => (
            <motion.div
              key={w.key}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <StatCard title={w.label} value={getValue(w.key)} icon={w.icon} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
