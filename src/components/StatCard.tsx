import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className={cn("glass-card animate-fade-in", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs">{title}</span>
        </div>
        <p className="text-xl font-bold font-display">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-1.5 text-xs">
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
      </CardContent>
    </Card>
  );
}
