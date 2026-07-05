/**
 * Editorial / Linear-style page primitives.
 *
 *   <Page>
 *     <PageHeader eyebrow="Workspace" title="Leads" description="..." actions={<Button .../>} />
 *     <PageSection>...</PageSection>
 *     <PageSection title="Recent">...</PageSection>
 *   </Page>
 */
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GradientIconTile } from "@/components/design/StudioKit";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("w-full space-y-6 animate-fade-in", className)}>{children}</div>;
}

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Optional lucide icon rendered as a gradient squircle to the left of the title. */
  icon?: ElementType;
  /** Optional mini-stat row (use MiniStat components) rendered on the right. */
  stats?: ReactNode;
  className?: string;
}

/**
 * Every page's opening bar. Rendered as the Studio-style gradient hero strip
 * so the visual language is consistent app-wide.
 */
export function PageHeader({
  eyebrow, title, description, actions, icon, stats, className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/20",
        "bg-gradient-to-br from-primary/10 via-background to-background",
        "shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-4">
        {icon && <GradientIconTile icon={icon} />}
        <div className="min-w-0 flex-1 space-y-1">
          {eyebrow && (
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </div>
          )}
          <h1 className="text-[20px] sm:text-[24px] font-semibold tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-[13px] text-muted-foreground max-w-2xl leading-relaxed">
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
    </header>
  );
}

interface PageSectionProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageSection({ title, description, actions, children, className }: PageSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || actions) && (
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Responsive grid: 1 col mobile, 2 col tablet, configurable desktop. */
export function PageGrid({
  children,
  cols = 3,
  className,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const lg =
    cols === 2 ? "lg:grid-cols-2" : cols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", lg, className)}>
      {children}
    </div>
  );
}
