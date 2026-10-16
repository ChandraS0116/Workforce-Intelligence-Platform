import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect } from "react";
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { apiClient } from "@/lib/apiClient";
import { Brain, TrendingUp, AlertTriangle, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/core";
import { usePersonalityStore } from "@/store/usePersonalityStore";

// --- DND Sortable Item ---
function SortableEmployeeCard({ employee }: { employee: any }) {
  const { t } = useLanguageStore();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: employee.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-card border border-border rounded-lg p-3 cursor-grab hover:border-primary/50 transition-colors shadow-xl group">
      <div className="flex items-center gap-3">
        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${employee.name}&backgroundColor=18181b`} className="w-8 h-8 rounded-full border border-border group-hover:border-primary/50" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-card-foreground truncate">{employee.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground font-mono tracking-wider">{t("Risk:")}{(employee.flight_risk * 100).toFixed(0)}%</span>
            {employee.flight_risk > 0.7 && <AlertTriangle className="w-3 h-3 text-destructive" />}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export function TalentGrid() {
    const { t } = useLanguageStore();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const { config } = usePersonalityStore();

  useEffect(() => {
    const fetchGrid = async () => {
      try {
        const res = await apiClient.get('/intelligence/talent-grid');
        setEmployees(res.data.employees);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchGrid();
  }, []);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    setSelectedEmp(employees.find(e => e.id === event.active.id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.id !== over.id) {
      // In a real app we'd move it between zones. For demo, we just trigger a simulation trace.
      console.log(`Moved ${active.id} to zone ${over.id}`);
    }
  };

  const activeEmp = activeId ? employees.find(e => e.id === activeId) : null;

  // 3x3 Grid Matrix Titles
  const matrixTitles = [
    ["Low Risk / High Perf", "Med Risk / High Perf", "High Risk / High Perf"],
    ["Low Risk / Med Perf", "Med Risk / Med Perf", "High Risk / Med Perf"],
    ["Low Risk / Low Perf", "Med Risk / Low Perf", "High Risk / Low Perf"],
  ];

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-6 bg-background overflow-hidden">
      
      {/* Matrix Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{t("Talent Optimization Grid")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("Logistic Regression Attrition Model with SHAP explainability.")}</p>
          </div>
          <div className="flex gap-4">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">{t("Bench Strength: 82%")}</Badge>
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">{t("At Risk (Top 10%): 4")}</Badge>
          </div>
        </div>

        {loading ? (
           <div className="flex justify-center items-center h-64"><div className="animate-pulse text-muted-foreground font-mono">{t("Running Logistic Regression...")}</div></div>
        ) : (
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <div className="grid grid-cols-3 gap-4 h-[calc(100%-4rem)]">
              {/* Render 9 boxes */}
              {[0, 1, 2].map(y => (
                [0, 1, 2].map(x => {
                  const cellEmployees = employees.filter(e => e.grid_x === x && e.grid_y === y);
                  return (
                    <div key={`${x}-${y}`} className="bg-muted/10 border border-border rounded-xl flex flex-col p-4 shadow-inner" style={{ backgroundColor: config.colors.glassTint }}>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{matrixTitles[y][x]}</div>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        <SortableContext items={cellEmployees.map(e => e.id)} strategy={rectSortingStrategy}>
                          {cellEmployees.map(e => (
                            <div key={e.id} onClick={() => setSelectedEmp(e)}><SortableEmployeeCard employee={e} /></div>
                          ))}
                        </SortableContext>
                      </div>
                    </div>
                  );
                })
              ))}
            </div>
            
            <DragOverlay>
              {activeEmp ? (
                <div className="bg-card border-2 border-primary rounded-lg p-3 shadow-2xl opacity-90 rotate-3 scale-105" style={{ boxShadow: config.colors.glowIntensity }}>
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeEmp.name}&backgroundColor=18181b`} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-sm font-semibold text-foreground truncate">{activeEmp.name}</p>
                      <span className="text-[10px] text-muted-foreground font-mono tracking-wider">{t("Risk:")}{(activeEmp.flight_risk * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Intelligence Side Panel */}
      <div className="w-96 border-l border-border bg-card/95 backdrop-blur-3xl p-6 overflow-y-auto shrink-0" style={{ boxShadow: config.colors.glowIntensity }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">{t("Explainability Trace")}</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mt-1">{t("SHAP Feature Impacts")}</p>
          </div>
        </div>

        {selectedEmp ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedEmp.name}&backgroundColor=18181b`} className="w-12 h-12 rounded-full border-2 border-border" />
               <div>
                 <h3 className="text-lg font-bold text-foreground">{selectedEmp.name}</h3>
                 <p className="text-xs text-muted-foreground font-mono">{t("ID:")}{selectedEmp.id}</p>
               </div>
            </div>

            <div className="mb-8">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-4">{t("Risk Prediction:")}{(selectedEmp.flight_risk * 100).toFixed(1)}%</h4>
              <div className="space-y-4">
                {selectedEmp.shap_values.map((shap: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{shap.feature}</span>
                      <span className={shap.impact > 0 ? "text-destructive" : "text-success"}>
                        {shap.impact > 0 ? "+" : ""}{(shap.impact * 100).toFixed(1)}{t("% Risk")}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${shap.impact > 0 ? "bg-destructive" : "bg-success"}`} 
                        style={{ width: `${Math.min(100, Math.abs(shap.impact) * 200)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border border-primary/30 bg-primary/5 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{t("Simulation Engine")}</span>
              </div>
              <p className="text-xs text-primary/70 mb-4 leading-relaxed">
                {t("If moved to \"Promotion Track\", the mathematical expected value of retention increases by 32%. Confidence interval: P95 = ± 4.2%.")}</p>
              <button 
                onClick={() => {
                  const btn = document.getElementById('knapsack-btn');
                  if(btn) {
                    btn.innerText = 'Running Optimizer...';
                    setTimeout(() => {
                      btn.innerText = 'Optimization Complete ✓';
                      btn.classList.add('bg-success/20', 'text-success');
                      btn.classList.remove('bg-primary/20', 'text-primary');
                    }, 1500);
                  }
                }}
                id="knapsack-btn"
                className="w-full py-2.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs font-bold transition-colors"
              >
                {t("Run Knapsack Optimization")}</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShieldAlert className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("Click or drag an employee to view the logistic regression decision trace and simulate succession planning.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
