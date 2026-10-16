import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/apiClient";
import { GanttChart, Crosshair, AlertOctagon, Activity, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/core";
import { usePersonalityStore } from "@/store/usePersonalityStore";

export function ResourceConflicts() {
    const { t } = useLanguageStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const { config } = usePersonalityStore();

  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        const res = await apiClient.get('/intelligence/conflicts');
        setTasks(res.data.tasks);
        setMetrics({ monte_carlo_p85_delay: res.data.monte_carlo_p85_delay });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchConflicts();
  }, []);

  const resolveConflict = () => {
    // Simulate MILP Resolution
    setLoading(true);
    setTimeout(() => {
      setTasks(tasks.map(t => t.id === 'task_1' ? { ...t, start_day: t.start_day + 3, conflict: false } : { ...t, conflict: false }));
      setMetrics({ monte_carlo_p85_delay: 1.2 });
      setSelectedTask(null);
      setLoading(false);
    }, 1500);
  };

  const days = Array.from({ length: 21 }, (_, i) => i); // 3 weeks

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-6 bg-background overflow-hidden">
      
      {/* Gantt Timeline Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{t("AI Schedule Optimizer")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("Automatically detect and resolve team workload overlaps without delaying projects.")}</p>
          </div>
          <div className="flex gap-4">
             <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{t("Critical Tasks:")}{tasks.filter(t=>t.critical_path).length}</Badge>
             <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">{t("Projected Delay:")}{metrics.monte_carlo_p85_delay} {t("days")}</Badge>
          </div>
        </div>

        {loading ? (
           <div className="flex justify-center items-center h-64"><div className="animate-pulse text-muted-foreground font-mono">{t("AI analyzing millions of scheduling paths...")}</div></div>
        ) : (
          <div className="bg-muted/10 border border-border rounded-xl p-4 overflow-x-auto shadow-inner" style={{ backgroundColor: config.colors.glassTint }}>
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="flex border-b border-border pb-2 mb-4">
                <div className="w-48 shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Task / Resource")}</div>
                <div className="flex-1 flex">
                  {days.map(d => (
                    <div key={d} className="flex-1 text-center text-[10px] text-muted-foreground font-mono border-l border-border">
                      {t("Day")}{d}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-3 relative">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center group">
                    <div className="w-48 shrink-0 pr-4">
                      <p className="text-sm font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedTask(task)}>{task.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{task.resource} • {task.project}</p>
                    </div>
                    <div className="flex-1 relative h-8 bg-background/50 rounded-md border border-border">
                      <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 800 }}
                        dragElastic={config.motion.dragResistance}
                        className={`absolute top-1 bottom-1 rounded shadow-lg cursor-grab active:cursor-grabbing flex items-center px-2 overflow-hidden ${
                          task.conflict ? 'bg-destructive/20 border-destructive/50' : 
                          task.critical_path ? 'bg-warning/20 border-warning/50' : 
                          'bg-primary/20 border-primary/50'
                        } border`}
                        style={{ 
                          left: `${(task.start_day / 21) * 100}%`, 
                          width: `${(task.duration / 21) * 100}%` 
                        }}
                        onClick={() => setSelectedTask(task)}
                      >
                         <span className={`text-[10px] font-bold ${task.conflict ? 'text-destructive' : task.critical_path ? 'text-warning' : 'text-primary'}`}>
                           {task.resource}
                         </span>
                      </motion.div>
                    </div>
                  </div>
                ))}

                {/* Render Conflict Overlay explicitly if Alice is double booked */}
                {tasks.some(t=>t.conflict) && (
                   <div className="absolute top-0 bottom-0 w-[4.7%] left-[14.2%] bg-destructive/10 border-x border-destructive/30 pointer-events-none flex justify-center">
                     <span className="text-[9px] text-destructive font-bold uppercase rotate-90 whitespace-nowrap mt-4 opacity-50 tracking-widest">{t("Double Booking")}</span>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decision Intelligence Panel */}
      <div className="w-96 border-l border-border bg-card/95 backdrop-blur-3xl p-6 overflow-y-auto shrink-0" style={{ boxShadow: config.colors.glowIntensity }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-warning/20 rounded-lg">
            <Settings2 className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">{t("AI Resolution Engine")}</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mt-1">{t("Conflict Analysis")}</p>
          </div>
        </div>

        {selectedTask ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <div className="p-5 bg-background border border-border rounded-xl">
              <h3 className="text-lg font-semibold text-foreground mb-1">{selectedTask.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{selectedTask.project}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/40 rounded-lg border border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t("Resource")}</p>
                  <p className="text-sm font-bold text-foreground">{selectedTask.resource}</p>
                </div>
                <div className="p-3 bg-muted/40 rounded-lg border border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t("Duration")}</p>
                  <p className="text-sm font-mono text-foreground">{selectedTask.duration}d</p>
                </div>
              </div>

              {selectedTask.critical_path && (
                <div className="mt-4 flex items-center gap-2 text-warning">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t("High Priority Task (Cannot be delayed)")}</span>
                </div>
              )}
            </div>

            {selectedTask.conflict && (
              <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertOctagon className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">{t("Schedule Overlap Detected")}</span>
                </div>
                <p className="text-xs text-foreground/70 mb-4 font-mono">
                  {selectedTask.resource} {t("is booked on two tasks at the same time.")}</p>
                
                <div className="space-y-3 mb-4">
                   <div className="p-3 bg-background rounded border border-success/40 relative overflow-hidden">
                     <div className="absolute right-0 top-0 bottom-0 w-1 bg-success/60"></div>
                     <p className="text-xs text-foreground font-semibold mb-1">{t("Option A: AI Smart Reschedule")}</p>
                     <p className="text-[10px] text-muted-foreground">{t("Delay DB Migration by 3 days. Project deadline remains safe. Cost: ₹0.")}</p>
                     <p className="text-[10px] text-success font-bold mt-1">{t("✨ Highly Recommended")}</p>
                   </div>
                   <div className="p-3 bg-background rounded border border-border">
                     <p className="text-xs text-foreground font-semibold mb-1">{t("Option B: External Contracting")}</p>
                     <p className="text-[10px] text-muted-foreground">{t("Hire a contractor to cover the workload. Impact: ₹4,500 over budget.")}</p>
                   </div>
                </div>

                <button onClick={resolveConflict} className="w-full py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg text-xs font-bold transition-colors">
                  {t("Apply AI Smart Reschedule")}</button>
              </div>
            )}
            
            {!selectedTask.conflict && (
               <div className="text-center p-6 border border-dashed border-border rounded-xl">
                 <Crosshair className="w-8 h-8 text-success mx-auto mb-2 opacity-50" />
                 <p className="text-xs text-muted-foreground font-mono">{t("Schedule optimized. No conflicts detected.")}</p>
               </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <GanttChart className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("Select a task block to view team workload analysis and AI rescheduling recommendations.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
