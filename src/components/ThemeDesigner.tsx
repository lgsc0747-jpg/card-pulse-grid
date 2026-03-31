import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT_COLORS = [
  { name: "Teal", value: "#0d9488" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Orange", value: "#f97316" },
  { name: "Emerald", value: "#10b981" },
];

interface ThemeDesignerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  saving?: boolean;
}

export function ThemeDesigner({ currentColor, onColorChange, saving }: ThemeDesignerProps) {
  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-sm flex items-center gap-2">
          <Palette className="w-4 h-4" /> Card Theme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => onColorChange(c.value)}
              disabled={saving}
              className={cn(
                "relative w-full aspect-square rounded-lg transition-all duration-200 hover:scale-110",
                currentColor === c.value && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
              )}
              style={{ backgroundColor: c.value }}
              title={c.name}
            >
              {currentColor === c.value && (
                <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
              )}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Changes are reflected instantly on your public profile.
        </p>
      </CardContent>
    </Card>
  );
}
