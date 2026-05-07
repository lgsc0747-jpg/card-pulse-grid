/**
 * Editorial / Linear-style page primitives.
 *
 *   <Page>
 *     <PageHeader eyebrow="Workspace" title="Leads" description="..." actions={<Button .../>} />
 *     <PageSection>...</PageSection>
 *     <PageSection title="Recent">...</PageSection>
 *   </Page>
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("w-full space-y-8", className)}>{children}</div>;
}

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 pb-5 border-b border-border", className)}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          {eyebrow && <div className="text-eyebrow">{eyebrow}</div>}
          <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-tight leading-tight">{title}</h1>
          {description && (
            <p className="text-[13px] text-muted-foreground max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
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
