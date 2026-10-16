import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Select } from "@/components/ui/core";
import { UserCheck, Sparkles, Wand2 } from "lucide-react";
import { useRBAC } from "@/hooks/useRBAC";
import { useNavigate } from "react-router-dom";

export function TeamBuilder() {
    const { t } = useLanguageStore();
  useRBAC("teambuilder");
  const navigate = useNavigate();
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState("3");
  const [timelineWeeks, setTimelineWeeks] = useState("12");
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await apiClient.get("/skills");
        setAvailableSkills(res.data);
      } catch (e) {
        console.error("Failed to load skills", e);
      }
    };
    fetchSkills();
  }, []);

  const handleAddSkill = (skillName: string) => {
    if (skillName && !selectedSkills.includes(skillName)) {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skillName));
  };

  const handleBuildTeam = async () => {
    setIsSimulating(true);
    
    try {
      const res = await apiClient.post("/ml/team-builder/recommend", {
        required_skills: selectedSkills.length > 0 ? selectedSkills : ["Python"],
        required_proficiency: "Senior",
        project_duration: parseInt(timelineWeeks),
        budget_category: "Medium",
        team_size: parseInt(teamSize)
      });
      setResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSwapIn = (candidate: any) => {
    if (!result) return;
    const newTeam = [...result.recommended_team];
    const newAlternates = [...result.alternate_candidates];

    // Find member in recommended team with lowest match score
    let lowestScoreIdx = 0;
    for (let i = 1; i < newTeam.length; i++) {
        if (newTeam[i].match_score < newTeam[lowestScoreIdx].match_score) {
            lowestScoreIdx = i;
        }
    }

    const swappedOut = newTeam[lowestScoreIdx];
    newTeam[lowestScoreIdx] = candidate;
    
    // Remove candidate from alternates and add swappedOut
    const candidateIdx = newAlternates.findIndex(a => a.employee_id === candidate.employee_id);
    newAlternates.splice(candidateIdx, 1);
    newAlternates.push(swappedOut);

    setResult({
        ...result,
        recommended_team: newTeam,
        alternate_candidates: newAlternates
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("Smart Team Builder")}</h1>
        <p className="text-muted-foreground">{t("AI-powered team synthesis based on skills, availability, and historical chemistry.")}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t("Project Requirements")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Required Skills")}</label>
                <Select value="" onValueChange={handleAddSkill}>
                  <option value="" disabled>{t("Select a skill...")}</option>
                  {availableSkills.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </Select>
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSkills.map(skill => (
                      <Badge 
                        key={skill} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors" 
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Team Size Target")}</label>
                <Select value={teamSize} onValueChange={setTeamSize}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n.toString()}>{n} {t("Members")}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Timeline (Weeks)")}</label>
                <Select value={timelineWeeks} onValueChange={setTimelineWeeks}>
                  {[2, 4, 8, 12, 16, 24, 36, 52].map(n => (
                    <option key={n} value={n.toString()}>{n} {t("Weeks")}</option>
                  ))}
                </Select>
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={handleBuildTeam}
                disabled={isSimulating}
              >
                {isSimulating ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" /> {t("Synthesizing...")}</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4" /> {t("Generate Optimal Team")}</span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Column */}
        {result && (
          <div className="lg:col-span-2 space-y-6 animate-in slide-in-from-right-8 duration-500">
            {/* Top Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t("Success Prob."), value: result.overall_team_success_probability },
                { label: t("Team Chemistry"), value: result.team_chemistry_score },
                { label: t("Delivery Risk"), value: result.delivery_risk_score },
                { label: t("Budget Fit"), value: result.budget_fit_score },
              ].map((metric, i) => (
                <div key={i} className="bg-card border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-muted-foreground font-medium mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold text-primary">{metric.value}%</p>
                </div>
              ))}
            </div>

            {/* Roster */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{t("Recommended Roster")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.recommended_team.map((emp: any) => (
                    <div key={emp.employee_id} className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{emp.display_name || emp.name}</p>
                            <p className="text-xs text-muted-foreground">{t(emp.role)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-xs font-bold ${emp.availability_status === 'Available' ? 'text-success' : 'text-warning'} flex items-center justify-end gap-1`}>
                              <UserCheck className="w-3 h-3" /> {t(emp.availability_status)}
                            </p>
                            <p className="text-xs text-muted-foreground">{t("Util:")}{emp.current_utilization}{t("% | Risk:")}{t(emp.risk_level)}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/employees/${emp.employee_id}`)}>{t("View")}</Button>
                        </div>
                      </div>
                      <p className="text-xs italic text-muted-foreground bg-background p-2 rounded border">
                        <span className="font-semibold not-italic">{t("Match Score:")}{emp.match_score}{t("% | Coverage:")}{emp.skill_coverage_contribution}%</span><br/>
                        {t(emp.reason_selected)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alternate Candidates */}
            {result.alternate_candidates && result.alternate_candidates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("Alternate Candidates")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.alternate_candidates.map((emp: any) => (
                      <div key={emp.employee_id} className="flex items-center justify-between p-3 rounded-lg border bg-background opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground text-xs">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{emp.display_name || emp.name} <span className="text-xs text-muted-foreground ml-2">{t("Match:")}{emp.match_score}%</span></p>
                            <p className="text-xs text-muted-foreground">{t(emp.role)} {t("| Util:")}{emp.current_utilization}%</p>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => handleSwapIn(emp)}>{t("Swap In")}</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


