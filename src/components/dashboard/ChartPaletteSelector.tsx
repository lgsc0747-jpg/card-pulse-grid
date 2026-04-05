import { useState, useEffect, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

type PaletteId = (typeof PALETTES)[number]["id"];

const STORAGE_KEY = "nfc_chart_palette";

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
}

const ChartPaletteContextFull = createContext<ChartPaletteContextValueFull>({
  colors: PALETTES[0].colors as unknown as string[],
  paletteId: "default",
  setPaletteId: () => {},
});

export function useChartPaletteFull() {
  return useContext(ChartPaletteContextFull);
}

export function ChartPaletteProvider({ children }: { children: React.ReactNode }) {
  const [paletteId, setPaletteId] = useState<PaletteId>(() => {
    return (localStorage.getItem(STORAGE_KEY) as PaletteId) || "default";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, paletteId);
  }, [paletteId]);

  const palette = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0];

  return (
    <ChartPaletteContextFull.Provider value={{ colors: [...palette.colors], paletteId, setPaletteId }}>
      <ChartPaletteContext.Provider value={{ colors: [...palette.colors], paletteId }}>
        {children}
      </ChartPaletteContext.Provider>
    </ChartPaletteContextFull.Provider>
  );
}

export function ChartPaletteSelector() {
  const { paletteId } = useChartPalette();
  const [selected, setSelected] = useState(paletteId);

  useEffect(() => setSelected(paletteId), [paletteId]);

  const apply = (id: PaletteId) => {
    setSelected(id);
    localStorage.setItem(STORAGE_KEY, id);
    window.location.reload();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
          <Palette className="w-3 h-3" /> Chart Colors
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="end">
        <p className="text-xs font-medium mb-2">Chart Color Palette</p>
        <div className="space-y-1.5">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => apply(p.id)}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${
                selected === p.id ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted"
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
        </div>
      </PopoverContent>
    </Popover>
  );
}
