export const BACKGROUND_PRESETS = [
  { id: "default", label: "Default", css: "none", preview: "bg-background" },
  {
    id: "carbon",
    label: "Carbon Fiber",
    css: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 6px)",
    preview: "bg-zinc-900",
  },
  {
    id: "mesh",
    label: "Mesh Gradient",
    css: "radial-gradient(at 40% 20%, hsla(178,80%,40%,0.3) 0px, transparent 50%), radial-gradient(at 80% 60%, hsla(280,60%,50%,0.2) 0px, transparent 50%)",
    preview: "bg-slate-900",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk Grid",
    css: "linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px)",
    preview: "bg-gray-950",
  },
  {
    id: "marble",
    label: "Minimalist Marble",
    css: "linear-gradient(135deg, rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.05) 25%, transparent 25%)",
    preview: "bg-stone-900",
  },
  {
    id: "holo",
    label: "Holographic",
    css: "linear-gradient(135deg, rgba(255,0,128,0.15), rgba(0,255,255,0.15), rgba(128,0,255,0.15))",
    preview: "bg-purple-950",
  },
  {
    id: "aurora",
    label: "Aurora",
    css: "linear-gradient(180deg, rgba(0,255,128,0.08) 0%, rgba(0,128,255,0.12) 50%, rgba(128,0,255,0.08) 100%)",
    preview: "bg-emerald-950",
  },
  {
    id: "sunset",
    label: "Sunset Glow",
    css: "linear-gradient(135deg, rgba(255,100,50,0.12), rgba(255,50,100,0.1), rgba(180,50,255,0.08))",
    preview: "bg-orange-950",
  },
] as const;

export type BackgroundPresetId = (typeof BACKGROUND_PRESETS)[number]["id"];

export function getPresetCss(id: string | null | undefined): string {
  return BACKGROUND_PRESETS.find((p) => p.id === id)?.css ?? "none";
}
