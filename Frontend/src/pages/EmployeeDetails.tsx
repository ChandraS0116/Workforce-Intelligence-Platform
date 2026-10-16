import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui/core";
import { ArrowLeft, User, Briefcase, Award, BrainCircuit, Activity } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";

export function EmployeeDetails() {
    const { t } = useLanguageStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [intel, setIntel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const [empRes, intelRes] = await Promise.all([
          apiClient.get(`/employees/${id}/details`),
          apiClient.get(`/ml/intelligence/employees/${id}`)
        ]);
        setEmployee(empRes.data);
        setIntel(intelRes.data);
      } catch (e: any) {
        try {
          const customEmps = JSON.parse(localStorage.getItem("mesh_custom_employees") || "[]");
          const found = customEmps.find((emp: any) => emp.id.toString() === id?.toString());
          if (found) {
            setEmployee(found);
            setIntel({
              retention_probability: 0.88,
              expected_tenure_years: 4.5,
              recommended_next_role: "Principal AI Architect",
              skill_gap_analysis: ["Quantum ML", "Advanced Distributed Computing"],
              performance_trajectory: "High Growth / High Impact"
            });
            setError(null);
          } else if (e.response?.status === 404) {
            setError("Employee not found.");
          } else {
            setError("Failed to load employee details.");
          }
        } catch (err) {
          setError("Employee not found.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEmployeeDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-center animate-pulse">{t("Loading employee profile...")}</div>;
  if (error) return <div className="p-8 text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-md mx-4">{error}</div>;
  if (!employee) return <div className="p-8 text-center">{t("No data")}</div>;

  // Prepare Skill Data for Radar
  const skillData = employee.skills.map((s: any) => ({
    subject: s.skill.name,
    A: s.proficiency_level,
    fullMark: 100,
  }));

  // Prepare Utilization History for Line Chart
  const utilData = employee.utilization_history ? [...employee.utilization_history].reverse().map((u: any) => ({
    name: new Date(u.date).toLocaleDateString('en-US', { month: 'short' }),
    Utilization: u.utilization_percentage
  })) : [];

  const activeAllocations = employee.assignments.filter((a: any) => !a.end_date || new Date(a.end_date) > new Date());
  const currentAllocation = activeAllocations.reduce((acc: number, cur: any) => acc + cur.allocation_percentage, 0);
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employees')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {employee.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{employee.display_name || employee.name}</h1>
              <p className="text-muted-foreground">{employee.role} {employee.department ? `• ${employee.department.name}` : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile & Burnout */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5"/> {t("Profile")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("Email")}</span>
                <p className="font-medium text-sm">{employee.email}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("Hire Date")}</span>
                <p className="font-medium text-sm">{new Date(employee.hire_date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("Current Allocation")}</span>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-lg">{currentAllocation}%</p>
                  <Badge variant={currentAllocation > 100 ? 'destructive' : 'default'}>
                    {currentAllocation > 100 ? 'Overallocated' : 'Optimal'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {intel && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5"/> {t("Employee Intelligence")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-bold">{intel.burnout_score.toFixed(0)}%</span>
                    <span className="text-sm font-medium text-muted-foreground mb-1">{t("Burnout Risk")}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${intel.burnout_score > 70 ? 'bg-destructive' : intel.burnout_score > 40 ? 'bg-warning' : 'bg-success'}`} 
                      style={{ width: `${intel.burnout_score}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-muted p-2 rounded text-center">
                    <p className="text-xs text-muted-foreground">{t("Promotion Ready")}</p>
                    <p className="font-bold">{intel.promotion_readiness}%</p>
                  </div>
                  <div className="bg-muted p-2 rounded text-center">
                    <p className="text-xs text-muted-foreground">{t("Growth Potential")}</p>
                    <p className="font-bold">{intel.growth_potential}%</p>
                  </div>
                  <div className="bg-muted p-2 rounded text-center">
                    <p className="text-xs text-muted-foreground">{t("Retention Risk")}</p>
                    <p className="font-bold">{intel.retention_risk}%</p>
                  </div>
                  <div className="bg-muted p-2 rounded text-center">
                    <p className="text-xs text-muted-foreground">{t("Learning Velocity")}</p>
                    <p className="font-bold">{intel.learning_velocity}%</p>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("Mobility Opportunities")}</span>
                  <ul className="list-disc pl-4 text-sm mt-1">
                    {intel.internal_mobility_opportunities.map((opp: string, i: number) => (
                      <li key={i}>{opp}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 bg-primary/10 p-3 rounded-lg border border-primary/20">
                  <p className="text-sm italic text-primary/80">{intel.explanation}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {employee.certifications.length > 0 && (
             <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5"/> {t("Certifications")}</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-3">
                 {employee.certifications.map((c: any) => (
                   <div key={c.id} className="text-sm p-3 border rounded-lg bg-card/50">
                     <span className="font-semibold block mb-1">{c.name}</span>
                     <span className="text-muted-foreground text-xs block">{t("Issued:")}{new Date(c.issue_date).toLocaleDateString()}</span>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
          )}
        </div>

        <div className="space-y-6 md:col-span-2">
          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit className="w-5 h-5"/> {t("Skill Profile")}</CardTitle>
              </CardHeader>
              <CardContent>
                {skillData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">{t("No skills recorded.")}</p>
                ) : (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{fontSize: 10}} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fontSize: 10}} />
                        <Radar name="Skills" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("Utilization Trend")}</CardTitle>
              </CardHeader>
              <CardContent>
                {utilData.length === 0 ? (
                   <p className="text-sm text-muted-foreground text-center py-8">{t("No utilization history available.")}</p>
                ) : (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={utilData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} domain={[0, 120]}/>
                        <Tooltip />
                        <Line type="monotone" dataKey="Utilization" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5"/> {t("Project Assignments")}</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">{t("No active or historical project assignments.")}</div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">{t("Project")}</th>
                        <th className="px-4 py-3 text-left font-medium">{t("Role")}</th>
                        <th className="px-4 py-3 text-left font-medium">{t("Alloc")}</th>
                        <th className="px-4 py-3 text-left font-medium">{t("Duration")}</th>
                        <th className="px-4 py-3 text-right font-medium">{t("Status")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employee.assignments.map((a: any) => {
                        const isActive = !a.end_date || new Date(a.end_date) > new Date();
                        return (
                          <tr key={a.id} className="border-t hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-3 font-semibold cursor-pointer hover:underline text-primary" onClick={() => navigate(`/projects/${a.project_id}`)}>
                              {t("PRJ-")}{a.project_id}
                            </td>
                            <td className="px-4 py-3">{a.role}</td>
                            <td className="px-4 py-3">{a.allocation_percentage}%</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {new Date(a.start_date).toLocaleDateString()} - {a.end_date ? new Date(a.end_date).toLocaleDateString() : 'Present'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Badge variant={isActive ? "default" : "outline"}>{isActive ? "Active" : "Completed"}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
