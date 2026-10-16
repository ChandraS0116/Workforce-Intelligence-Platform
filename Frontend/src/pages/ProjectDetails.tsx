import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui/core";
import { ArrowLeft, Target, Users, Settings2, AlertTriangle, CheckCircle2 } from "lucide-react";

export function ProjectDetails() {
    const { t } = useLanguageStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const res = await apiClient.get(`/projects/${id}/details`);
        setProject(res.data);
      } catch (e: any) {
        if (e.response?.status === 404) {
          setError("Project not found.");
        } else {
          setError("Failed to load project details.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProjectDetails();
  }, [id]);

  // Compute Missing Skills
  const missingSkills = useMemo(() => {
    if (!project) return [];
    
    // For MVP frontend diff visualization, let's assume we want to show all requirements
    // and flag them if headcount < required. Since we didn't join all employee skills, 
    // we do a simple mock validation: if team size < requirements headcount, flag as missing.
    const teamSize = project.assignments.length;
    
    return project.requirements.map((req: any) => ({
      ...req,
      isMissing: teamSize < req.required_headcount
    }));
  }, [project]);

  if (loading) return <div className="p-8 text-center animate-pulse">{t("Loading project details...")}</div>;
  if (error) return <div className="p-8 text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-md mx-4">{error}</div>;
  if (!project) return <div className="p-8 text-center">{t("No data")}</div>;

  const outcome = project.outcomes && project.outcomes.length > 0 ? project.outcomes[0] : { success_score: 85, delayed_days: 0, budget_variance: 0 };
  const healthScore = outcome.success_score;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={project.status === 'Active' ? 'default' : 'outline'}>{project.status}</Badge>
              <span className="text-sm text-muted-foreground ml-2">
                {new Date(project.start_date).toLocaleDateString()} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}
              </span>
            </div>
            {project.description && (
              <p className="text-muted-foreground mt-3 max-w-3xl leading-relaxed text-sm">{project.description}</p>
            )}
          </div>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate('/team-builder')}>{t("Smart Staffing")}</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Project Health / Overview */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5"/> {t("Project Health")}</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-end justify-between mb-2">
                <span className="text-4xl font-bold">{healthScore.toFixed(0)}</span>
                <span className="text-sm font-medium text-muted-foreground mb-1">/ 100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${healthScore < 50 ? 'bg-destructive' : healthScore < 80 ? 'bg-warning' : 'bg-success'}`} 
                  style={{ width: `${healthScore}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {healthScore < 80 ? 'Project is at risk of delays or budget overruns.' : 'Project is tracking towards successful delivery.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> {t("Risk Indicators")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{t("Schedule Variance")}</span>
                  <span className="font-medium">{outcome.delayed_days > 0 ? `+${outcome.delayed_days} days` : 'On track'}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{t("Budget Variance")}</span>
                  <span className={`font-medium ${outcome.budget_variance > 0 ? 'text-destructive' : ''}`}>
                    {outcome.budget_variance > 0 ? `+${outcome.budget_variance}%` : 'On track'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 md:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5"/> {t("Skill Requirements & Gaps")}</CardTitle>
              </CardHeader>
              <CardContent>
                {missingSkills.length === 0 ? (
                  <p className="text-sm text-muted-foreground border-2 border-dashed rounded-lg p-6 text-center">{t("No explicit skill requirements defined.")}</p>
                ) : (
                  <div className="space-y-3">
                    {missingSkills.map((req: any) => (
                      <div key={req.id} className={`flex justify-between items-center p-3 border rounded-lg bg-card ${req.isMissing ? 'border-warning/50' : 'border-success/50'}`}>
                        <div className="flex items-center gap-3">
                          {req.isMissing ? <AlertTriangle className="w-4 h-4 text-warning" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
                          <div>
                            <p className="font-semibold text-sm">{req.skill.name}</p>
                            <p className="text-xs text-muted-foreground">{t("Lvl")}{req.required_proficiency} {t("required")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{req.required_headcount} {t("Needed")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/> {t("Team Roster")}</CardTitle>
              </CardHeader>
              <CardContent>
                {project.assignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground border-2 border-dashed rounded-lg p-6 text-center">{t("No team members assigned.")}</p>
                ) : (
                  <div className="space-y-3">
                    {project.assignments.map((assignment: any) => (
                      <div key={assignment.id} className="flex justify-between items-center p-3 border rounded-lg bg-card hover:border-primary/50 cursor-pointer transition-colors" onClick={() => navigate(`/employees/${assignment.employee.id}`)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                            {assignment.employee.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm hover:text-primary transition-colors">{assignment.employee.display_name || assignment.employee.name}</p>
                            <p className="text-xs text-muted-foreground">{assignment.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{assignment.allocation_percentage}{t("% Alloc")}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
