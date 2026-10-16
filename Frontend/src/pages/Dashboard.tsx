import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { KPICard } from "@/components/ui/KPICard";
import { InsightCard } from "@/components/ui/InsightCard";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui/core";
import { Activity, ShieldCheck, Target, BrainCircuit, Settings2, X } from "lucide-react";
import { GlobalTalentHeatmap } from "@/components/GlobalTalentHeatmap";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";

export function Dashboard() {
    const { t } = useLanguageStore();
  const [data, setData] = useState<{ utilization: any[]; risks: any[]; attrition?: any[] } | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('dashboard-prefs');
    return saved ? JSON.parse(saved) : {
      showKPIs: true,
      showUtilization: true,
      showRisks: true,
      showInsights: true,
      order: ["kpis", "charts", "insights"]
    };
  });

  useEffect(() => {
    localStorage.setItem('dashboard-prefs', JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [utilRes, riskRes, healthRes, recsRes, attrRes] = await Promise.all([
          apiClient.get("/dashboard/utilization"),
          apiClient.get("/dashboard/risks"),
          apiClient.get("/ml/intelligence/workforce-health"),
          apiClient.get("/ml/intelligence/recommendations"),
          apiClient.get("/ml/intelligence/attrition-radar")
        ]);
        setData({ utilization: utilRes.data, risks: riskRes.data, attrition: attrRes.data });
        setHealth(healthRes.data);
        setRecommendations(recsRes.data);
      } catch (e: any) {
        console.error("Failed to load dashboard data", e);
        setError("Failed to connect to intelligence API. Please check your network connection.");
      }
    };
    fetchData();
  }, []);

  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!data || !health) return <div className="p-8 text-center animate-pulse">{t("Loading intelligence...")}</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Executive Dashboard")}</h1>
          <p className="text-muted-foreground">{t("AI-driven insights for workforce planning and risk mitigation.")}</p>
        </div>
        <Button variant="outline" onClick={() => setShowSettings(true)}>
          <Settings2 className="w-4 h-4 mr-2" /> {t("Customize")}</Button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-[400px] shadow-2xl relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setShowSettings(false)}>
              <X className="w-4 h-4" />
            </Button>
            <CardHeader><CardTitle>{t("Dashboard Settings")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={prefs.showKPIs} onChange={(e) => setPrefs({...prefs, showKPIs: e.target.checked})} className="w-4 h-4" />
                <span className="font-medium">{t("Show KPI Cards")}</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={prefs.showUtilization} onChange={(e) => setPrefs({...prefs, showUtilization: e.target.checked})} className="w-4 h-4" />
                <span className="font-medium">{t("Show Utilization Chart")}</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={prefs.showRisks} onChange={(e) => setPrefs({...prefs, showRisks: e.target.checked})} className="w-4 h-4" />
                <span className="font-medium">{t("Show Risk Profile Chart")}</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={prefs.showInsights} onChange={(e) => setPrefs({...prefs, showInsights: e.target.checked})} className="w-4 h-4" />
                <span className="font-medium">{t("Show AI Insights")}</span>
              </label>
              <Button className="w-full mt-4" onClick={() => setShowSettings(false)}>{t("Save Preferences")}</Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-8">
        <div style={{ order: prefs.order?.indexOf("kpis") || 0 }}>
          {prefs.showKPIs && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              <KPICard title={t("Overall Health")} value={`${health.overall_score}/100`} trend="+2.1%" trendDirection="up" icon={<Activity className="w-5 h-5" />} />
              <KPICard title={t("Capacity Health")} value={`${health.capacity_health}/100`} trend="-1.5%" trendDirection="down" icon={<ShieldCheck className="w-5 h-5" />} />
              <KPICard title={t("Skill Readiness")} value={`${health.skill_readiness}%`} trend="+5.0%" trendDirection="up" icon={<Target className="w-5 h-5" />} />
              <KPICard title={t("Burnout Risk")} value={`${health.burnout_risk}%`} trend="-2.0%" trendDirection="down" icon={<BrainCircuit className="w-5 h-5 text-warning" />} />
              <KPICard title={t("Delivery Readiness")} value={`${health.delivery_readiness}%`} trend="+1.2%" trendDirection="up" icon={<Target className="w-5 h-5" />} />
            </div>
          )}
        </div>

        <div style={{ order: (prefs.order?.indexOf("kpis") || 0) + 0.5 }}>
          <GlobalTalentHeatmap />
        </div>

        <div style={{ order: prefs.order?.indexOf("charts") || 1 }} className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {prefs.showUtilization && (
            <Card className="lg:col-span-4">
              <CardHeader><CardTitle>{t("Workforce Capacity vs Utilization (6 Months)")}</CardTitle></CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.utilization} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCapacity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="capacity" name="Available Capacity" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorCapacity)" />
                    <Area type="monotone" dataKey="utilized" name="Actual Utilization" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorUtil)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {prefs.showRisks && (
            <div className="lg:col-span-3 space-y-6 flex flex-col">
              <Card className="flex-1">
                <CardHeader><CardTitle>{t("Department Risk Profile")}</CardTitle></CardHeader>
                <CardContent className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.risks} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="department" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                      <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="delayRisk" name="Delay Risk %" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="budgetRisk" name="Budget Risk %" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {data.attrition && (
                <Card className="flex-1 border-destructive/20 shadow-sm bg-destructive/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" /> {t("Predictive Attrition Radar")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.attrition.slice(0, 3).map((emp: any, i: number) => (
                        <div key={i} className="flex items-start justify-between border-b border-destructive/10 pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="font-bold text-sm text-foreground">{emp.name} <span className="text-xs font-normal text-muted-foreground">({emp.role})</span></p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">{emp.reason}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-destructive text-destructive-foreground shadow-sm">
                              {emp.riskScore}{t("% Risk")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <div style={{ order: prefs.order?.indexOf("insights") || 2 }}>
          {prefs.showInsights && (
            <div className="grid gap-6 md:grid-cols-2">
              {recommendations.map((rec: any, idx: number) => (
                <InsightCard 
                  key={idx}
                  type={rec.severity === 'high' ? 'danger' : rec.severity === 'medium' ? 'warning' : 'success'}
                  title={rec.title}
                  confidenceScore={rec.confidence * 100}
                  reason={rec.business_impact}
                  impact={rec.business_impact}
                  recommendedAction={rec.recommendation}
                  expectedOutcome={rec.expected_outcome}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
