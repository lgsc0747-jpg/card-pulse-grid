import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: { value: number; label: string };
  icon: ReactNode;
  className?: string;
}

export function StatCard({ title, value, trend, icon, className }: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <div className={cn("glass-card rounded-lg p-5 animate-fade-in", className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
          {icon}
        </div>
      </div>
      <div className="font-display text-3xl font-bold tracking-tight">{value}</div>
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          {isPositive ? (
            <TrendingUp className="w-3 h-3 stat-trend-up" />
          ) : (
            <TrendingDown className="w-3 h-3 stat-trend-down" />
          )}
          <span className={isPositive ? "stat-trend-up" : "stat-trend-down"}>
            {isPositive ? "+" : ""}{trend.value}%
          </span>
          <span className="text-muted-foreground ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
