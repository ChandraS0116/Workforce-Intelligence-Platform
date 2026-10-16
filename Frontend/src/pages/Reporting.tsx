import { useLanguageStore } from "@/store/useLanguageStore";
import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Save, History, Star, Clock, Plus, X, Filter, LayoutTemplate, CheckCircle2 } from "lucide-react";
import { Button, Input, Select, SelectItem } from "@/components/ui/core";
import { apiClient } from "@/lib/apiClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const REPORT_TYPES = [
  { id: "health", name: "Workforce Health Report", desc: "Capacity, skills, and burnout metrics." },
  { id: "projects", name: "Project Portfolio Report", desc: "Status and risk of all active projects." },
  { id: "skills", name: "Skill Gap Report", desc: "Supply vs Demand analysis for key skills." },
  { id: "exec", name: "Executive Summary", desc: "High-level aggregated KPIs." },
  { id: "attrition", name: "Predictive Attrition & Flight Risk", desc: "List of employees at high risk of leaving and root causes." },
  { id: "chemistry", name: "Team Chemistry Matrix", desc: "Collaboration bottlenecks and recommended pairings." },
  { id: "forecast", name: "Capacity Forecast Report", desc: "30/90/180-day headcount and utilization projections." }
];

export function Reporting() {
    const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState("standard"); // standard, custom
  const [generating, setGenerating] = useState(false);
  const [savedReports, setSavedReports] = useState([
    { id: 1, name: t("Weekly Executive Summary"), schedule: "Weekly", type: "exec" },
    { id: 2, name: t("Monthly Skill Gap Analysis"), schedule: "Monthly", type: "skills" }
  ]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  
  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({ type: "health", frequency: "Weekly" });

  // Configure & Generate Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configTarget, setConfigTarget] = useState<string | null>(null);
  const [filters, setFilters] = useState({ department: t("All"), riskLevel: "All" });

  // Custom Builder State
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const toggleModule = (id: string) => {
    setSelectedModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleGenerate = async (format: "pdf" | "excel") => {
    if (!configTarget && selectedModules.length === 0) return;
    setGenerating(true);
    setShowConfigModal(false);

    try {
      const typesToFetch = configTarget ? [configTarget] : selectedModules;
      const doc = new jsPDF();
      let yOffset = 20;

      const wb = XLSX.utils.book_new();

      for (let i = 0; i < typesToFetch.length; i++) {
        const typeId = typesToFetch[i];
        let headers: string[] = [];
        let body: any[][] = [];
        let title = "Report";
        let sheetName = "Data";
        let rawDataForExcel: any[] = [];
        
        if (typeId === "health") {
            const res = await apiClient.get('/ml/intelligence/workforce-health');
            const data = res.data;
            title = "Workforce Health Report";
            sheetName = "Health";
            headers = ['Metric', 'Score'];
            body = [
                ['Overall Health', `${data.overall_score}%`],
                ['Capacity Health', `${data.capacity_health}%`],
                ['Skill Readiness', `${data.skill_readiness}%`],
                ['Burnout Risk', `${data.burnout_risk}%`],
                ['Delivery Readiness', `${data.delivery_readiness}%`],
            ];
            rawDataForExcel = body.map(row => ({ Metric: row[0], Score: row[1] }));
        } else if (typeId === "projects") {
            const res = await apiClient.get('/projects');
            const data = res.data;
            title = "Project Portfolio Report";
            sheetName = "Projects";
            headers = ['Name', 'Status', 'Priority', 'Budget (INR)', 'End Date'];
            body = data.map((p: any) => [
                p.name, p.status, p.priority, p.budget, p.end_date || 'N/A'
            ]);
            rawDataForExcel = data.map((p: any) => ({
                Name: p.name, Status: p.status, Priority: p.priority, Budget: p.budget, EndDate: p.end_date || 'N/A'
            }));
        } else if (typeId === "skills") {
            const res = await apiClient.get('/ml/intelligence/skill-gaps');
            const data = res.data;
            title = "Skill Gap Analysis";
            sheetName = "Skill Gaps";
            headers = ['Skill', 'Supply', 'Demand', 'Gap'];
            body = data.map((s: any) => [
                s.skill, s.supply, s.demand, s.gap
            ]);
            rawDataForExcel = data.map((s: any) => ({
                Skill: s.skill, Supply: s.supply, Demand: s.demand, Gap: s.gap
            }));
        } else if (typeId === "exec") {
            const res = await apiClient.get('/executive/metrics');
            const data = res.data;
            title = "Executive Summary";
            sheetName = "Executive";
            
            headers = ['Metric Category', 'Score/Value'];
            body = [
                ['Workforce Health Score', `${(data.health_score || 0).toFixed(1)}%`],
                ['Overall Delivery Risk', data.delivery_risk || 'Low'],
                ['Average Utilization', `${(data.utilization || 0).toFixed(1)}%`],
                ['Talent Acquisition Target', `${data.headcount_needed || 0} Headcount`]
            ];
            rawDataForExcel = body.map(row => ({ Category: row[0], Value: row[1] }));
        } else if (typeId === "attrition") {
            const res = await apiClient.get('/ml/intelligence/attrition-radar');
            const data = res.data;
            title = "Predictive Attrition Risk";
            sheetName = "Attrition";
            headers = ['Employee', 'Role', 'Risk Score', 'Root Cause'];
            body = data.map((e: any) => [e.name, e.role, `${e.riskScore}%`, e.reason]);
            rawDataForExcel = data.map((e: any) => ({ Employee: e.name, Role: e.role, RiskScore: e.riskScore, RootCause: e.reason }));
        } else if (typeId === "chemistry") {
            const res = await apiClient.get('/ml/intelligence/team-chemistry');
            const data = res.data;
            title = "Team Chemistry Matrix";
            sheetName = "Chemistry";
            headers = ['Node ID', 'Group', 'Degree Centrality'];
            body = data.graph?.nodes?.slice(0, 50).map((n: any) => [n.id, n.group, n.degree]) || [];
            rawDataForExcel = body.map(row => ({ NodeID: row[0], Group: row[1], Degree: row[2] }));
        } else if (typeId === "forecast") {
            const res = await apiClient.get('/dashboard/utilization');
            const data = res.data;
            title = "Capacity Forecast";
            sheetName = "Forecast";
            headers = ['Month', 'Capacity', 'Utilized'];
            body = data.map((d: any) => [d.month, d.capacity, `${d.utilized}%`]);
            rawDataForExcel = data.map((d: any) => ({ Month: d.month, Capacity: d.capacity, Utilized: d.utilized }));
        }

        // Add to PDF
        if (format === "pdf") {
          if (i > 0) {
            doc.addPage();
            yOffset = 20;
          }
          doc.setFontSize(16);
          doc.text(title, 14, yOffset);
          
          // Add filters if any
          if (filters.department !== "All" || filters.riskLevel !== "All") {
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Filters applied: Dept=${filters.department}, Risk=${filters.riskLevel}`, 14, yOffset + 6);
            yOffset += 8;
          }

          autoTable(doc, {
              startY: yOffset + 10,
              head: [headers],
              body: body,
          });
        }

        // Add to Excel
        if (format === "excel") {
          const ws = XLSX.utils.json_to_sheet(rawDataForExcel);
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }
      }

      // Save File
      const finalTitle = configTarget ? REPORT_TYPES.find(r=>r.id === configTarget)?.name : "Custom_Master_Brief";
      
      if (format === "pdf") {
        doc.save(`${finalTitle?.replace(/\s+/g, '_')}.pdf`);
      } else {
        XLSX.writeFile(wb, `${finalTitle?.replace(/\s+/g, '_')}.xlsx`);
      }
      
      // Add to history
      setRecentReports(prev => [{
          id: Date.now(),
          name: finalTitle,
          format: format.toUpperCase(),
          time: new Date().toLocaleString()
      }, ...prev]);

      setConfigTarget(null);
      if (!configTarget) setSelectedModules([]); // clear builder

    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleScheduleSave = () => {
    const reportTemplate = REPORT_TYPES.find(r => r.id === scheduleConfig.type);
    const newReport = {
      id: Date.now(),
      name: `${scheduleConfig.frequency} ${reportTemplate?.name}`,
      schedule: `${scheduleConfig.frequency}`,
      type: scheduleConfig.type
    };
    setSavedReports([...savedReports, newReport]);
    setShowScheduleModal(false);
  };

  return (
    <div className="space-y-8 relative">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("Reporting Center")}</h1>
        <p className="text-muted-foreground mt-1">{t("Generate, schedule, and export advanced business intelligence.")}</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b">
        <button 
          onClick={() => setActiveTab("standard")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'standard' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          {t("Standard Reports")}</button>
        <button 
          onClick={() => setActiveTab("custom")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'custom' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          {t("Custom Brief Builder")}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area based on Tab */}
        <div className="lg:col-span-2 space-y-4">
          
          {activeTab === "standard" && (
            <>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> {t("Pre-Built Reports")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REPORT_TYPES.map(report => (
                  <div key={report.id} className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-colors flex flex-col justify-between group">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{report.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">{report.desc}</p>
                    </div>
                    <Button 
                      className="w-full gap-2 mt-auto" 
                      variant="secondary"
                      onClick={() => {
                        setConfigTarget(report.id);
                        setShowConfigModal(true);
                      }}
                    >
                      <Filter className="w-4 h-4" /> {t("Configure & Generate")}</Button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "custom" && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{t("Custom Master Brief")}</h2>
                  <p className="text-sm text-muted-foreground">{t("Select multiple modules to compile into a single executive PDF or Excel workbook.")}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {REPORT_TYPES.map(report => (
                  <label key={report.id} onClick={() => toggleModule(report.id)} className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${selectedModules.includes(report.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}>
                    <div className="mt-0.5">
                      {selectedModules.includes(report.id) ? 
                        <CheckCircle2 className="w-5 h-5 text-primary" /> : 
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      }
                    </div>
                    <div>
                      <h3 className="font-medium">{report.name}</h3>
                      <p className="text-xs text-muted-foreground">{report.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1 gap-2" size="lg" disabled={selectedModules.length === 0 || generating} onClick={() => handleGenerate("pdf")}>
                  <FileText className="w-5 h-5" /> {t("Generate PDF Brief")}</Button>
                <Button className="flex-1 gap-2" variant="outline" size="lg" disabled={selectedModules.length === 0 || generating} onClick={() => handleGenerate("excel")}>
                  <FileSpreadsheet className="w-5 h-5" /> {t("Export Excel Workbook")}</Button>
              </div>
            </div>
          )}
        </div>

        {/* Saved & Scheduled - Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold">{t("Scheduled Reports")}</h3>
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowScheduleModal(true)}>
                <Plus className="w-4 h-4 mr-1" /> {t("New")}</Button>
            </div>
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {savedReports.map(sr => (
                <div key={sr.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{sr.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" /> {sr.schedule}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => { setConfigTarget(sr.type); handleGenerate("pdf"); }}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{t("Recent Generations")}</h3>
            </div>
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {recentReports.length > 0 ? (
                recentReports.map(rr => (
                  <div key={rr.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">{rr.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{rr.time}</p>
                    </div>
                    <span className="text-xs font-semibold bg-muted px-2 py-1 rounded">
                      {rr.format}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-sm text-muted-foreground text-center">
                  {t("No recent reports found.")}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Configure & Generate Modal Overlay */}
      {showConfigModal && configTarget && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border shadow-2xl rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setShowConfigModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold">{t("Configure Report")}</h2>
              <p className="text-sm text-muted-foreground mt-1">{REPORT_TYPES.find(r=>r.id===configTarget)?.name}</p>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("Department Filter")}</label>
                <Select value={filters.department} onValueChange={(val: string) => setFilters({...filters, department: val})}>
                  <SelectItem value="All">{t("All Departments")}</SelectItem>
                  <SelectItem value="Engineering">{t("Engineering")}</SelectItem>
                  <SelectItem value="Design">{t("Design")}</SelectItem>
                  <SelectItem value="Product">{t("Product")}</SelectItem>
                  <SelectItem value="Sales">{t("Sales")}</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("Risk Threshold")}</label>
                <Select value={filters.riskLevel} onValueChange={(val: string) => setFilters({...filters, riskLevel: val})}>
                  <SelectItem value="All">{t("Show All")}</SelectItem>
                  <SelectItem value="High">{t("High Risk Only")}</SelectItem>
                  <SelectItem value="Medium">{t("Medium & High")}</SelectItem>
                </Select>
              </div>

              <div className="pt-4 flex gap-3">
                <Button className="flex-1 gap-2" disabled={generating} onClick={() => handleGenerate("pdf")}>
                  <FileText className="w-4 h-4" /> {t("Download PDF")}</Button>
                <Button className="flex-1 gap-2" variant="outline" disabled={generating} onClick={() => handleGenerate("excel")}>
                  <FileSpreadsheet className="w-4 h-4" /> {t("Export Excel")}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal Overlay */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border shadow-lg rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setShowScheduleModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6">{t("Schedule New Report")}</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Report Type")}</label>
                <Select value={scheduleConfig.type} onValueChange={(val: string) => setScheduleConfig({...scheduleConfig, type: val})}>
                  {REPORT_TYPES.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Frequency")}</label>
                <Select value={scheduleConfig.frequency} onValueChange={(val: string) => setScheduleConfig({...scheduleConfig, frequency: val})}>
                  <SelectItem value="Daily">{t("Daily")}</SelectItem>
                  <SelectItem value="Weekly">{t("Weekly")}</SelectItem>
                  <SelectItem value="Monthly">{t("Monthly")}</SelectItem>
                  <SelectItem value="Quarterly">{t("Quarterly")}</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Delivery Email")}</label>
                <Input type="email" placeholder={t("executive@company.com")} />
              </div>

              <Button className="w-full mt-4" onClick={handleScheduleSave}>
                <Save className="w-4 h-4 mr-2" /> {t("Save Schedule")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
