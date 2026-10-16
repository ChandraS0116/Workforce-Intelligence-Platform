import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/core";
import { useRBAC } from "@/hooks/useRBAC";
import { ReadOnlyBanner } from "@/components/ReadOnlyBanner";
import { formatINR } from "@/lib/utils";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Briefcase, GraduationCap, Handshake, Clock, Banknote } from "lucide-react";

export function SkillGap() {
    const { t } = useLanguageStore();
  const { isReadOnly } = useRBAC("skills");
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    const fetchGaps = async () => {
      try {
        const res = await apiClient.get('/ml/intelligence/skill-gaps');
        setData(res.data);
      } catch (e) {
        console.error("Failed to load skill gaps", e);
      }
    };
    fetchGaps();
  }, []);

  if (!data) return <div className="p-8 text-center animate-pulse">{t("Loading skill gap intelligence...")}</div>;

  // Transform data for charts
  const gapAnalysisData = data.gaps.map((g: any) => ({
    skill: g.skill,
    demand: g.current_demand,
    supply: g.current_supply,
    gap: g.gap
  }));

  const currentSkillsData = gapAnalysisData.map((g: any) => ({
    subject: g.skill,
    A: g.supply,
    fullMark: Math.max(...gapAnalysisData.map((d: any) => d.supply)) + 10
  }));

  const buyAction = data.gaps.filter((g: any) => g.recommended_action === "BUY");
  const buildAction = data.gaps.filter((g: any) => g.recommended_action === "BUILD");
  const borrowAction = data.gaps.filter((g: any) => g.recommended_action === "BORROW");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {isReadOnly && <ReadOnlyBanner />}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("Skill Gap Intelligence")}</h1>
        <p className="text-muted-foreground">{t("Analyze current workforce capabilities against projected project demands.")}</p>
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">{t("Buy / Build / Borrow Recommendations")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Buy (Hire) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="p-2 bg-primary/10 rounded-md text-primary">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-lg">{t("Buy (Hire)")}</h4>
                </div>
                <div className="space-y-3">
                  {buyAction.length === 0 && <p className="text-sm text-muted-foreground italic">{t("No critical hiring needs.")}</p>}
                  {buyAction.map((g: any, i: number) => (
                    <div key={i} className="p-4 bg-background border rounded-lg shadow-sm hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-foreground">{g.skill}</span>
                        <Badge variant="destructive">{t("Short:")}{g.gap}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{g.rationale}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Banknote className="w-3 h-3" /> {formatINR(g.estimated_cost)}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" /> {g.estimated_time_to_close}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Build (Train) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="p-2 bg-success/10 rounded-md text-success">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-lg">{t("Build (Train)")}</h4>
                </div>
                <div className="space-y-3">
                  {buildAction.length === 0 && <p className="text-sm text-muted-foreground italic">{t("No training recommendations.")}</p>}
                  {buildAction.map((g: any, i: number) => (
                    <div key={i} className="p-4 bg-background border rounded-lg shadow-sm hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-foreground">{g.skill}</span>
                        <Badge variant="outline">{t("Short:")}{g.gap}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{g.rationale}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Banknote className="w-3 h-3" /> {formatINR(g.estimated_cost)}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" /> {g.estimated_time_to_close}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Borrow (Contract) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="p-2 bg-warning/10 rounded-md text-warning">
                    <Handshake className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-lg">{t("Borrow (Contract)")}</h4>
                </div>
                <div className="space-y-3">
                  {borrowAction.length === 0 && <p className="text-sm text-muted-foreground italic">{t("No urgent contracting needs.")}</p>}
                  {borrowAction.map((g: any, i: number) => (
                    <div key={i} className="p-4 bg-background border rounded-lg shadow-sm hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-foreground">{g.skill}</span>
                        <Badge variant="secondary">{t("Short:")}{g.gap}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{g.rationale}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Banknote className="w-3 h-3" /> {formatINR(g.estimated_cost)}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" /> {g.estimated_time_to_close}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("Current Organizational Skill Profile")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={currentSkillsData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar
                  name="Current Capability"
                  dataKey="A"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.5}
                />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Supply vs Demand Gap Analysis")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={gapAnalysisData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="skill" type="category" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="supply" name="Current Supply" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="demand" name="Projected Demand" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
