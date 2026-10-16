import { useLanguageStore } from "@/store/useLanguageStore";
import { Card, CardContent } from "./core";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon: ReactNode;
  className?: string;
}

export function KPICard({ title, value, trend, trendDirection, icon, className }: KPICardProps) {
    const { t } = useLanguageStore();
  return (
    <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground tracking-tight">
            {title}
          </p>
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <div className="text-3xl font-bold tracking-tighter">{value}</div>
          {trend && (
            <p className={cn(
              "text-xs font-semibold flex items-center gap-1",
              trendDirection === "up" ? "text-emerald-500" : 
              trendDirection === "down" ? "text-destructive" : 
              "text-muted-foreground"
            )}>
              {trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : "→"} {trend} {t("from last month")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
