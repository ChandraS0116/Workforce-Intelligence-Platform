import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui/core";
import { InsightCard } from "@/components/ui/InsightCard";
import { Maximize2, Download, TrendingUp } from "lucide-react";
import { exportToPDF } from "@/lib/exportUtils";
import { useNavigate } from "react-router-dom";
import { useLanguageStore } from "@/store/useLanguageStore";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ZAxis } from 'recharts';

export function PortfolioCommandCenter() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguageStore();

  useEffect(() => {
    const fetchCommandCenter = async () => {
      try {
        const dq = await apiClient.get('/data-quality/issues');
        const forecast = await apiClient.get('/executive/forecast');
        const metrics = await apiClient.get('/executive/metrics');
        const recs = await apiClient.get('/ml/intelligence/recommendations');
        
        const insights = Array.isArray(recs.data) ? recs.data : (recs.data.recommendations || []);
        const primaryRec = insights[0] || null;

        const issues = dq.data || [];
        const score = Math.max(0, 100 - (issues.length * 5));

        const overview = await apiClient.get('/dashboard/overview');
        const projectRisks = await apiClient.get('/analytics/project-risks');

        setData({
          dataQuality: { score, issues },
          forecast: forecast.data,
          readinessIndex: metrics.data?.executive_readiness?.value ?? null,
          workforceHealth: metrics.data?.workforce_health?.value ?? null,
          projectHealth: overview.data?.stats?.active_projects ? 100 : null, // Simplistic mapping, ideally add to metrics later
          skillReadiness: metrics.data?.skill_readiness?.value ?? null,
          activeProjects: overview.data?.stats?.active_projects ?? null,
          criticalRisks: insights.length,
          primaryRec,
          projectRisks: projectRisks.data || []
        });
      } catch (e) {
        console.error(e);
        setError(true);
      }
    };
    fetchCommandCenter();
  }, []);

  useEffect(() => {
    if (demoMode) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch((e) => console.log(e));
    }
  }, [demoMode]);

  const handleExport = () => {
    exportToPDF("Executive Portfolio Command Center", 
      ["Metric", "Value"], 
      [
        ["Executive Readiness Index", `${data?.readinessIndex ?? 'No Data Available'}%`],
        ["Workforce Health", `${data?.workforceHealth ?? 'No Data Available'}%`],
        ["Project Health", `${data?.projectHealth ?? 'No Data Available'}%`],
        ["Skill Readiness", `${data?.skillReadiness ?? 'No Data Available'}%`],
        ["Active Projects", `${data?.activeProjects ?? 'No Data Available'}`],
        ["Critical Risks", `${data?.criticalRisks ?? 0}`],
      ]
    );
  };

  if (error) return <div className="p-12 text-center text-destructive">{t("Failed to load command center data. Please check backend connection.")}</div>;
  if (!data) return (
    <div className="p-12 space-y-6 animate-pulse">
      <div className="h-10 bg-muted w-1/4 rounded"></div>
      <div className="grid grid-cols-4 gap-4">
        <div className="h-32 bg-muted rounded"></div>
        <div className="h-32 bg-muted rounded"></div>
        <div className="h-32 bg-muted rounded"></div>
        <div className="h-32 bg-muted rounded"></div>
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 h-64 bg-muted rounded"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-8 animate-in fade-in duration-700 ${demoMode ? 'fixed inset-0 z-50 bg-background p-12 overflow-y-auto' : ''}`}>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t("Portfolio Command Center")}</h1>
          <p className="text-lg text-muted-foreground mt-2">{t("Executive Overview & Risk Aggregation")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2"/> {t('Export Report')}</Button>
          <Button variant={demoMode ? "destructive" : "default"} onClick={() => setDemoMode(!demoMode)}>
            <Maximize2 className="w-4 h-4 mr-2" />
            {demoMode ? "Exit Demo Mode" : "Executive Demo Mode"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-primary/10 border-primary/20 shadow-lg shadow-primary/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-primary">{t("Executive Readiness Index")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-black text-primary">{data.readinessIndex ?? 'No Data Available'}</div>
            <p className="text-sm text-primary/80 mt-2 font-medium">{t("Unified Platform Score")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t("Workforce Health")}</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-bold">{data.workforceHealth ?? 'No Data Available'}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t("Project Health")}</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-bold">{data.projectHealth ?? 'No Data Available'}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t("Skill Readiness")}</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-bold text-amber-500">{data.skillReadiness ?? 'No Data Available'}</div></CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {data.primaryRec ? (
            <InsightCard 
              type={data.primaryRec.severity === "high" ? "warning" : "info"}
              title={t(data.primaryRec.title)}
              confidenceScore={Math.round((data.primaryRec.confidence || 0) * 100)}
              reason={data.primaryRec.business_impact || "No impact provided."}
              impact={data.primaryRec.expected_outcome || "No outcome provided."}
              recommendedAction={data.primaryRec.recommendation || "No action provided."}
              expectedOutcome={data.primaryRec.expected_outcome || "No outcome provided."}
            />
          ) : (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>{t("Executive Summary & Recommendations")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground p-8">{t("Insufficient data to generate AI recommendations.")}</div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>{t("Data Quality Engine")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold">{t("Data Integrity Score")}</span>
                <span className="text-2xl font-bold text-emerald-500">{data.dataQuality.score ?? 'N/A'}%</span>
              </div>
              <div className="space-y-4">
                {data.dataQuality.issues && data.dataQuality.issues.length > 0 ? (
                  data.dataQuality.issues.map((iss: any, i: number) => (
                    <div key={i} className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${iss.severity === 'High' ? 'bg-destructive/20 text-destructive' : 'bg-amber-500/20 text-amber-600'}`}>{iss.severity} {t('RISK')}</span>
                        <span className="text-xs text-muted-foreground">{iss.entity}</span>
                      </div>
                      <p className="text-sm font-medium">{iss.issue}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t("Recommended:")}{iss.recommendation || iss.recommended_fix}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">{t("No data quality issues detected.")}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* New Project Risk Scatter Plot */}
          <Card className="shadow-md lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> {t('Project Risk Portfolio')}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              {data.projectRisks && data.projectRisks.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis type="number" dataKey="scheduleVariance" name="Schedule Variance" unit=" days" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis type="number" dataKey="budgetVariance" name="Budget Variance" unit="%" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <ZAxis type="number" dataKey="successScore" range={[60, 400]} name="Health Score" />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Scatter name="Projects" data={data.projectRisks} fill="hsl(var(--chart-4))" fillOpacity={0.7} />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">{t("No risk data available")}</div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-md bg-destructive/5 border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">{t("Critical Risks")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black text-destructive mb-4">{data.criticalRisks ?? 0}</div>
              <p className="text-sm text-muted-foreground mb-4">{t("Projects currently identified as high-risk by the Success Prediction Model.")}</p>
              <Button variant="destructive" className="w-full" onClick={() => navigate('/projects')}>{t("Review Portfolio Risks")}</Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>{t("30-Day Forecast Outlook")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-muted-foreground">{t("Capacity Demand")}</span>
                  <span className="font-bold">{data.forecast?.forecasts?.['30_days']?.hiring_demand ?? 'N/A'} {t("FTEs")}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-muted-foreground">{t("Est. Utilization")}</span>
                  <span className="font-bold text-amber-500">{data.forecast?.forecasts?.['30_days']?.utilization_forecast != null ? `${data.forecast.forecasts['30_days'].utilization_forecast}%` : 'N/A'}</span>
                </div>
                <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/forecasting')}>{t("Open Forecaster")}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
