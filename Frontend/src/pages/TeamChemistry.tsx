import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/core";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { AlertTriangle, Users } from "lucide-react";

export function TeamChemistry() {
    const { t } = useLanguageStore();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/ml/intelligence/team-chemistry');
        setData(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  if (!data) return <div className="p-8 text-center animate-pulse">{t("Analyzing network chemistry...")}</div>;

  // Process network data to circular layout with degree centrality
  const nodesWithPositions = data.graph?.nodes.map((n: any, i: number) => {
    const angle = (i / data.graph.nodes.length) * 2 * Math.PI;
    const r = 40 + (Math.random() * 40); // spread them out
    const degree = data.graph.links.filter((l: any) => l.source === n.id || l.target === n.id).length;
    return {
      ...n,
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
      degree: Math.max(1, degree)
    };
  }) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("Team Chemistry Engine")}</h1>
        <p className="text-muted-foreground">{t("Historical collaboration and communication risk analytics.")}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">{t("Collaboration Density")}</p>
          <p className="text-3xl font-bold text-primary">{data.collaboration_density}%</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">{t("Strongest Pair")}</p>
          <p className="text-lg font-bold text-primary mt-2">{data.strongest_team[0]} & {data.strongest_team[1]}</p>
          {data.strongest_team_explanation && <p className="text-xs text-muted-foreground mt-2">{data.strongest_team_explanation}</p>}
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">{t("Weakest Pair")}</p>
          <p className="text-lg font-bold text-destructive mt-2">{data.weakest_team[0]} & {data.weakest_team[1]}</p>
          {data.weakest_team_explanation && <p className="text-xs text-muted-foreground mt-2">{data.weakest_team_explanation}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="h-full shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> {t("Network Topography")}</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] bg-muted/5 border-t relative overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis type="number" dataKey="x" hide />
                  <YAxis type="number" dataKey="y" hide />
                  <ZAxis type="number" dataKey="degree" range={[50, 400]} />
                  <RechartsTooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    labelFormatter={() => ''}
                    formatter={(_val: any, _name: any, props: any) => [props.payload.degree + ' Collaborations', props.payload.name]}
                  />
                  <Scatter name="Employees" data={nodesWithPositions} fill="hsl(var(--primary))" fillOpacity={0.8} />
                </ScatterChart>
              </ResponsiveContainer>
              <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 p-2 rounded shadow-sm border">
                {t("Nodes:")}{data.graph?.nodes?.length} {t("| Edges:")}{data.graph?.links?.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-md border-amber-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-500"><AlertTriangle className="w-4 h-4" /> {t("Isolation Risks")}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.isolated_employees_explanation && <p className="text-sm text-muted-foreground mb-4">{data.isolated_employees_explanation}</p>}
              {data.isolated_employees && data.isolated_employees.length > 0 ? (
                <ul className="space-y-2">
                  {data.isolated_employees.map((emp: string, i: number) => (
                    <li key={i} className="p-2 border rounded bg-amber-500/5 text-amber-600 font-medium text-sm flex justify-between items-center">
                      <span>{emp}</span>
                      <Badge variant="outline" className="text-xs border-amber-500/50">{t("Isolated")}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground p-4 bg-muted/20 rounded text-center">{t("No isolated employees detected.")}</div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>{t("Collaboration Risks")}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.collaboration_risk_explanation && <p className="text-sm text-muted-foreground mb-4">{data.collaboration_risk_explanation}</p>}
              <ul className="space-y-2">
                {data.collaboration_risk_areas.map((c: string, i: number) => (
                  <li key={i} className="p-2 border rounded bg-destructive/10 text-destructive font-medium text-sm">{c}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("Recommended Pairings")}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recommended_pairings_explanation && <p className="text-sm text-muted-foreground mb-4">{data.recommended_pairings_explanation}</p>}
              <ul className="space-y-2">
                {data.recommended_pairings.map((c: string, i: number) => (
                  <li key={i} className="p-2 border rounded bg-emerald-500/10 text-emerald-700 font-medium">{c}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
