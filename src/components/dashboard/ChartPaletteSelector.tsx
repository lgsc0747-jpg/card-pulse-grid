import { useState, useEffect, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Palette } from "lucide-react";

const PALETTES = [
  { id: "default", label: "Default", colors: ["hsl(174, 72%, 40%)", "hsl(221, 83%, 53%)", "hsl(280, 65%, 55%)", "hsl(45, 93%, 58%)", "hsl(350, 80%, 55%)"] },
  { id: "ocean", label: "Ocean", colors: ["hsl(200, 80%, 50%)", "hsl(220, 70%, 60%)", "hsl(180, 60%, 45%)", "hsl(240, 50%, 65%)", "hsl(160, 55%, 50%)"] },
  { id: "sunset", label: "Sunset", colors: ["hsl(15, 85%, 55%)", "hsl(35, 90%, 55%)", "hsl(350, 75%, 55%)", "hsl(280, 60%, 55%)", "hsl(50, 85%, 55%)"] },
  { id: "forest", label: "Forest", colors: ["hsl(145, 60%, 42%)", "hsl(120, 45%, 50%)", "hsl(80, 55%, 48%)", "hsl(160, 50%, 40%)", "hsl(100, 40%, 55%)"] },
  { id: "neon", label: "Neon", colors: ["hsl(300, 100%, 60%)", "hsl(180, 100%, 50%)", "hsl(60, 100%, 50%)", "hsl(120, 100%, 50%)", "hsl(270, 100%, 65%)"] },
  { id: "pastel", label: "Pastel", colors: ["hsl(210, 60%, 75%)", "hsl(340, 55%, 75%)", "hsl(150, 50%, 72%)", "hsl(40, 70%, 78%)", "hsl(270, 50%, 76%)"] },
  { id: "monochrome", label: "Mono", colors: ["hsl(0, 0%, 40%)", "hsl(0, 0%, 55%)", "hsl(0, 0%, 70%)", "hsl(0, 0%, 30%)", "hsl(0, 0%, 85%)"] },
] as const;

type PaletteId = (typeof PALETTES)[number]["id"] | "custom";

const STORAGE_KEY = "nfc_chart_palette";
const CUSTOM_COLORS_KEY = "nfc_chart_custom_colors";
const DEFAULT_CUSTOM: string[] = ["#0d9488", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

interface ChartPaletteContextValue {
  colors: string[];
  paletteId: string;
}

const ChartPaletteContext = createContext<ChartPaletteContextValue>({
  colors: PALETTES[0].colors as unknown as string[],
  paletteId: "default",
});

export function useChartPalette() {
  return useContext(ChartPaletteContext);
}

interface ChartPaletteContextValueFull extends ChartPaletteContextValue {
  setPaletteId: (id: PaletteId) => void;
  customColors: string[];
  setCustomColors: (colors: string[]) => void;
}

const ChartPaletteContextFull = createContext<ChartPaletteContextValueFull>({
  colors: PALETTES[0].colors as unknown as string[],
  paletteId: "default",
  setPaletteId: () => {},
  customColors: DEFAULT_CUSTOM,
  setCustomColors: () => {},
});

export function useChartPaletteFull() {
  return useContext(ChartPaletteContextFull);
}

export function ChartPaletteProvider({ children }: { children: React.ReactNode }) {
  const [paletteId, setPaletteId] = useState<PaletteId>(() => {
    return (localStorage.getItem(STORAGE_KEY) as PaletteId) || "default";
  });
  const [customColors, setCustomColors] = useState<string[]>(() => {
    try { const r = localStorage.getItem(CUSTOM_COLORS_KEY); if (r) return JSON.parse(r); } catch {}
    return DEFAULT_CUSTOM;
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, paletteId); }, [paletteId]);
  useEffect(() => { localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(customColors)); }, [customColors]);

  const resolvedColors = paletteId === "custom"
    ? customColors
    : [...(PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0]).colors];

  return (
    <ChartPaletteContextFull.Provider value={{ colors: resolvedColors, paletteId, setPaletteId, customColors, setCustomColors }}>
      <ChartPaletteContext.Provider value={{ colors: resolvedColors, paletteId }}>
        {children}
      </ChartPaletteContext.Provider>
    </ChartPaletteContextFull.Provider>
  );
}

export function ChartPaletteSelector() {
  const { paletteId, setPaletteId, customColors, setCustomColors } = useChartPaletteFull();

  const updateCustomColor = (index: number, color: string) => {
    const updated = [...customColors];
    updated[index] = color;
    setCustomColors(updated);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
          <Palette className="w-3 h-3" /> Chart Colors
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <p className="text-xs font-medium mb-2">Chart Color Palette</p>
        <div className="space-y-1.5">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPaletteId(p.id)}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${
                paletteId === p.id ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted"
              }`}
            >
              <div className="flex gap-0.5">
                {p.colors.map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className="font-medium">{p.label}</span>
            </button>
          ))}

          {/* Custom palette */}
          <button
            onClick={() => setPaletteId("custom")}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${
              paletteId === "custom" ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted"
            }`}
          >
            <div className="flex gap-0.5">
              {customColors.map((c, i) => (
                <div key={i} className="w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="font-medium">Custom</span>
          </button>

          {paletteId === "custom" && (
            <div className="pt-2 border-t border-border/40 mt-2 space-y-1.5">
              <p className="text-[10px] text-muted-foreground font-medium">Pick your colors</p>
              <div className="flex gap-1.5">
                {customColors.map((c, i) => (
                  <label key={i} className="relative cursor-pointer">
                    <div className="w-8 h-8 rounded-lg border-2 border-border/50 hover:border-primary/50 transition-colors" style={{ backgroundColor: c }} />
                    <Input
                      type="color"
                      value={c}
                      onChange={(e) => updateCustomColor(i, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
