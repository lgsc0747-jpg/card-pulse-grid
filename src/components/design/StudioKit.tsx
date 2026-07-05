/**
 * Studio Kit — shared design primitives that give every surface the
 * "Agency Studio" language: gradient hero strips, mini-stat pill rows,
 * gradient icon squircles, and bento cards with the soft hover lift.
 *
 * These are the atoms. Compose them anywhere.
 */
import type { ReactNode, ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Gradient icon squircle — the 40–48px primary-gradient tile
   ───────────────────────────────────────────────────────────── */

interface GradientIconTileProps {
  icon: ElementType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GradientIconTile({ icon: Icon, size = "md", className }: GradientIconTileProps) {
  const sz =
    size === "sm" ? "w-9 h-9 rounded-xl" :
    size === "lg" ? "w-14 h-14 rounded-2xl" :
    "w-12 h-12 rounded-2xl";
  const isz = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-center bg-gradient-to-br from-primary to-primary/60 shadow-[var(--shadow-card)]",
        sz,
        className,
      )}
    >
      <Icon className={cn("text-primary-foreground", isz)} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Mini-stat pill + row — compact tabular-nums chips
   ───────────────────────────────────────────────────────────── */

interface MiniStatProps {
  label: string;
  value: ReactNode;
  tone?: "default" | "positive" | "warning" | "destructive";
}

export function MiniStat({ label, value, tone = "default" }: MiniStatProps) {
  const toneClass =
    tone === "positive" ? "text-emerald-500" :
    tone === "warning" ? "text-amber-500" :
    tone === "destructive" ? "text-destructive" :
    "";
  return (
    <div className="px-3 py-2 rounded-xl bg-background/60 border border-border/60 backdrop-blur-sm">
      <div className={cn("text-sm font-semibold tabular-nums leading-none", toneClass)}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export function MiniStatRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap gap-2 text-xs", className)}>{children}</div>;
}

/* ─────────────────────────────────────────────────────────────
   Hero strip — the gradient card the Agency page opens with
   ───────────────────────────────────────────────────────────── */

interface HeroStripProps {
  icon?: ElementType;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  stats?: ReactNode;
  className?: string;
}

export function HeroStrip({
  icon, eyebrow, title, description, actions, stats, className,
}: HeroStripProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/20",
        "bg-gradient-to-br from-primary/10 via-background to-background",
        "shadow-[var(--shadow-card)] animate-fade-in",
        className,
      )}
    >
      {/* Soft aurora glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-4">
        {icon && <GradientIconTile icon={icon} />}
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
              {eyebrow}
            </div>
          )}
          <h1 className="text-[20px] sm:text-[24px] font-semibold tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-[13px] text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {(stats || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
            {stats}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Bento card — Card with the signature hover lift baked in
   ───────────────────────────────────────────────────────────── */

interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function BentoCard({ className, interactive = true, ...props }: BentoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl text-card-foreground",
        "shadow-[var(--shadow-card)] transition-all duration-240 ease-ios will-change-transform",
        interactive && "hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated,var(--shadow-card))]",
        className,
      )}
      {...props}
    />
  );
}
