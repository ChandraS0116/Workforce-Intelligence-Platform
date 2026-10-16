import { useLanguageStore } from "@/store/useLanguageStore";
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui/core";
import { formatINR } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function ScenarioSimulator() {
    const { t } = useLanguageStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    hiring_percent: 5,
    attrition_percent: 5,
    training_budget: 50000,
    new_projects: 2,
    utilization_target: 85
  });

  const simulate = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/ml/scenario-simulator', params);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getDeltaIcon = (base: number, proj: number, isBadIfHigher: boolean = false) => {
    if (proj > base) return isBadIfHigher ? <TrendingUp className="w-4 h-4 text-destructive" /> : <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (proj < base) return isBadIfHigher ? <TrendingDown className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const chartData = data ? [
    {
      name: t("Headcount"),
      Baseline: data.baseline.headcount,
      Projected: data.projected.headcount,
    },
    {
      name: t("Health Score"),
      Baseline: data.baseline.health_score,
      Projected: data.projected.health_score,
    }
  ] : [];



  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("Scenario Simulator")}</h1>
        <p className="text-muted-foreground">{t("What-if analysis and financial trade-offs for workforce optimization.")}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Simulation Parameters")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Hiring Target (%)")}</label>
                <Input type="number" value={params.hiring_percent} onChange={(e) => setParams({...params, hiring_percent: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Attrition Rate (%)")}</label>
                <Input type="number" step="0.01" value={params.attrition_percent} onChange={(e) => setParams({...params, attrition_percent: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Training Budget (₹)")}</label>
                <Input type="number" value={params.training_budget} onChange={(e) => setParams({...params, training_budget: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("New Projects Imminent")}</label>
                <Input type="number" value={params.new_projects} onChange={(e) => setParams({...params, new_projects: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Utilization Target (%)")}</label>
                <Input type="number" value={params.utilization_target} onChange={(e) => setParams({...params, utilization_target: parseFloat(e.target.value)})} />
              </div>
              <Button className="w-full" onClick={simulate} disabled={loading}>
                {loading ? "Simulating..." : "Run Simulation"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          {data ? (
            <>
              <Card className="bg-primary/5 border-primary/20 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">{t("AI Insight")}</span>
                    {t("Scenario Narrative")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-medium leading-relaxed">{data.narrative}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">{t("Workforce Health")}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-2xl font-bold">{data.baseline.health_score}</p>
                      <p className="text-xs text-muted-foreground">{t("Baseline")}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-2xl font-bold flex items-center gap-2">
                        {data.projected.health_score}
                        {getDeltaIcon(data.baseline.health_score, data.projected.health_score)}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("Projected")}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">{t("Monthly Run Rate")}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-lg font-bold">{formatINR(data.baseline.run_rate)}</p>
                      <p className="text-xs text-muted-foreground">{t("Baseline")}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-lg font-bold flex items-center gap-2">
                        {formatINR(data.projected.run_rate)}
                        {getDeltaIcon(data.baseline.run_rate, data.projected.run_rate, true)}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("Projected")}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm">{t("Headcount & Health Shift")}</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip cursor={{fill: 'hsl(var(--muted)/0.2)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                        <Bar dataKey="Baseline" fill="hsl(var(--muted-foreground)/0.3)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Projected" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm">{t("Cost Breakdown")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-2 border rounded bg-muted/10">
                        <span className="text-sm font-medium">{t("Hiring Cost")}</span>
                        <span className="text-sm font-bold text-destructive">+{formatINR(data.cost_breakdown.hiring_cost)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded bg-muted/10">
                        <span className="text-sm font-medium">{t("Training Budget")}</span>
                        <span className="text-sm font-bold text-destructive">+{formatINR(data.cost_breakdown.training_cost)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded bg-muted/10">
                        <span className="text-sm font-medium">{t("Severance / Lost Prod.")}</span>
                        <span className="text-sm font-bold text-destructive">+{formatINR(data.cost_breakdown.severance_cost)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded bg-emerald-500/10 border-emerald-500/20">
                        <span className="text-sm font-medium text-emerald-700">{t("Attrition Savings")}</span>
                        <span className="text-sm font-bold text-emerald-600">-{formatINR(data.cost_breakdown.attrition_savings)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("Delivery Risk")}</p>
                      <p className={`text-lg font-bold ${data.delivery_impact === 'High' ? 'text-destructive' : 'text-emerald-500'}`}>{data.delivery_impact}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("Skill Gaps")}</p>
                      <p className="text-sm font-bold text-primary mt-1">{data.skill_gap_impact}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center border rounded-lg bg-muted/5 min-h-[400px]">
              <div className="text-center space-y-2">
                <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground font-medium">{t("Adjust parameters and run simulation")}</p>
                <p className="text-xs text-muted-foreground">{t("See how hiring, attrition, and training impact your bottom line.")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
