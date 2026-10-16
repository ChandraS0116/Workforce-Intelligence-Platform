import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Target, 
  Zap, 
  AlertTriangle,
  Presentation,
  Maximize
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/core";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export function Executive() {
    const { t } = useLanguageStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [recs, setRecs] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, rRes, fRes] = await Promise.all([
          apiClient.get('/executive/metrics'),
          apiClient.get('/ml/intelligence/recommendations'),
          apiClient.get('/executive/forecast')
        ]);
        setMetrics(mRes.data);
        setRecs(rRes.data);
        setForecast(fRes.data.forecasts);
        setError(false);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    let interval: any;
    if (demoMode) {
      interval = setInterval(fetchData, 30000);
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
    return () => clearInterval(interval);
  }, [demoMode]);

  if (error) {
    return <div className="p-8 text-center text-destructive">{t("Failed to load Executive Intelligence. Please check connection.")}</div>;
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-10 bg-muted w-1/3 rounded"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    );
  }

  const forecastData = [
    { name: t("30 Days"), capacity: forecast?.['30_days']?.capacity_forecast || 1000, demand: forecast?.['30_days']?.total_demand || 850 },
    { name: t("90 Days"), capacity: forecast?.['90_days']?.capacity_forecast || 1050, demand: forecast?.['90_days']?.total_demand || 950 },
    { name: t("180 Days"), capacity: forecast?.['180_days']?.capacity_forecast || 1100, demand: forecast?.['180_days']?.total_demand || 1050 },
    { name: t("365 Days"), capacity: forecast?.['365_days']?.capacity_forecast || 1150, demand: forecast?.['365_days']?.total_demand || 1200 }
  ];

  return (
    <div className={`space-y-6 ${demoMode ? 'p-8 bg-background min-h-screen' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            {t("Executive Command Center")}</h1>
          <p className="text-muted-foreground mt-1">{t("Strategic oversight and AI-driven portfolio recommendations.")}</p>
        </div>
        <Button 
          variant={demoMode ? "destructive" : "default"} 
          onClick={() => setDemoMode(!demoMode)} 
          className="gap-2 shadow-lg hover:shadow-primary/25 transition-all"
        >
          {demoMode ? <Maximize className="w-4 h-4" /> : <Presentation className="w-4 h-4" />}
          {demoMode ? t("Exit Demo Mode") : t("Presentation Mode")}
        </Button>
      </div>

      {/* KPI Row - Drilldowns enabled via Link/cursor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/employees" className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group">
          <div className="flex items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{t("Executive Readiness")}</h3>
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-bold">{metrics?.executive_readiness?.value ?? 'No Data Available'}%</div>
          <p className="text-xs text-muted-foreground mt-1">{t("Platform aggregated score")}</p>
        </Link>
        
        <Link to="/chemistry" className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group">
          <div className="flex items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{t("Workforce Health")}</h3>
            <Activity className="w-4 h-4 text-success" />
          </div>
          <div className="text-3xl font-bold">{metrics?.workforce_health?.value ?? 'No Data Available'}%</div>
          <p className="text-xs text-muted-foreground mt-1">{t("Capacity and utilization stability")}</p>
        </Link>

        <Link to="/skill-gap" className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group">
          <div className="flex items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{t("Skill Readiness")}</h3>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold">{metrics?.skill_readiness?.value ?? 'No Data Available'}%</div>
          <p className="text-xs text-muted-foreground mt-1">{t("Supply vs future demand")}</p>
        </Link>

        <Link to="/projects" className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-destructive/50 transition-all group">
          <div className="flex items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-destructive transition-colors">{t("Talent Risk")}</h3>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-3xl font-bold text-destructive">{metrics?.talent_risk?.value ?? 'No Data Available'}%</div>
          <p className="text-xs text-muted-foreground mt-1">{t("Aggregate burnout index")}</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendations */}
        <div className="col-span-1 lg:col-span-2 bg-card border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">{t("Strategic Priorities & Risks")}</h2>
              <p className="text-sm text-muted-foreground">{t("AI-generated executive action items")}</p>
            </div>
            <ShieldAlert className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            {recs && recs.length > 0 ? (
              recs.map((rec, i) => (
                <div key={i} className={`p-4 rounded-lg border-l-4 ${rec.severity === 'high' ? 'bg-destructive/5 border-destructive' : rec.severity === 'medium' ? 'bg-amber-500/5 border-amber-500' : 'bg-primary/5 border-primary'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{t(rec.title)}</h4>
                    <span className="text-xs font-mono bg-background px-2 py-1 rounded shadow-sm">{(rec.confidence * 100).toFixed(0)}{t("% CONF")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{t(rec.business_impact)}</p>
                  <div className="text-sm font-medium bg-background/50 p-2 rounded">
                    <span className="text-primary mr-2">{t("Action:")}</span>
                    {t(rec.recommendation)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground border rounded-lg bg-muted/20">
                {t("Insufficient data to generate AI recommendations.")}</div>
            )}
          </div>
        </div>

        {/* Forecast Outlook */}
        <div className="col-span-1 bg-card border rounded-xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">{t("Forecast Outlook")}</h2>
              <p className="text-sm text-muted-foreground">{t("Capacity vs Demand Trend")}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="capacity" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCap)" name={t("Capacity")} />
                <Area type="monotone" dataKey="demand" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorDem)" name={t("Demand Gap")} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">{t("Shortage Warning")}</h4>
            <div className="flex flex-wrap gap-2">
              {forecast?.['90_days']?.skill_shortage?.map((s: string, i: number) => (
                <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
