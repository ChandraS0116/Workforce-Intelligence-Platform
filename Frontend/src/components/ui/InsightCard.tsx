import { Card, CardContent, CardHeader, CardTitle, Button } from "./core";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, TrendingUp, Sparkles } from "lucide-react";

interface InsightCardProps {
  title: string;
  confidenceScore: number;
  reason: string;
  impact: string;
  recommendedAction: string;
  expectedOutcome: string;
  type?: "success" | "warning" | "danger" | "info";
  className?: string;
}

import { useLanguageStore } from "@/store/useLanguageStore";

export function InsightCard({
  title,
  confidenceScore,
  reason,
  impact,
  recommendedAction,
  expectedOutcome,
  type = "info",
  className,
}: InsightCardProps) {
  const { t } = useLanguageStore();
  
  const getTypeColor = () => {
    switch(type) {
      case "success": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "warning": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "danger": return "text-destructive bg-destructive/10 border-destructive/20";
      default: return "text-primary bg-primary/10 border-primary/20";
    }
  };

  const Icon = () => {
    switch(type) {
      case "success": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "danger": return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default: return <Info className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <Card className={cn("overflow-hidden border-l-4 relative", getTypeColor().split(" ")[2], className)}>
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="w-24 h-24" />
      </div>
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon />
            <CardTitle className="text-lg">{t(title)}</CardTitle>
          </div>
          <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", getTypeColor())}>
            {confidenceScore}% {t("Confidence")}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">{t("Reason")}</p>
            <p className="font-medium text-foreground">{t(reason)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">{t("Business Impact")}</p>
            <p className="font-medium text-foreground">{t(impact)}</p>
          </div>
        </div>
        
        <div className="rounded-md bg-accent/50 p-4 border border-border/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-semibold tracking-wider text-primary mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {t("AI Recommended Action")}
              </p>
              <p className="font-semibold text-base mb-1">{t(recommendedAction)}</p>
              <p className="text-muted-foreground flex items-center gap-1.5 mt-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="font-medium">{t("Expected Outcome:")}</span> {t(expectedOutcome)}
              </p>
            </div>
            <Button 
              size="sm" 
              variant="default"
              onClick={() => {
                // Simulate action application
                const btn = document.getElementById(`apply-btn-${title.replace(/\s+/g, '-')}`);
                if (btn) {
                  btn.innerHTML = `<span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg> ${t("Applied")}</span>`;
                  btn.classList.remove('bg-primary');
                  btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700', 'text-white');
                  btn.setAttribute('disabled', 'true');
                }
              }}
              id={`apply-btn-${title.replace(/\s+/g, '-')}`}
              className="mt-2 shrink-0"
            >
              {t("Apply")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
