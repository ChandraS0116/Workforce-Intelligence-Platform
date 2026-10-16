import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle, AlertTriangle, Hammer, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/core";
import { useNavigate } from "react-router-dom";

export function DataQuality() {
    const { t } = useLanguageStore();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/data-quality/issues');
      setIssues(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const score = Math.max(0, 100 - issues.length * 2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Data Quality Center")}</h1>
          <p className="text-muted-foreground mt-1">{t("Automated detection of data anomalies and structural issues.")}</p>
        </div>
        <Button onClick={fetchIssues} variant="outline" className="gap-2" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {t("Scan Now")}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative overflow-hidden rounded-full">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
              <circle 
                cx="64" cy="64" r="60" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={377} 
                strokeDashoffset={377 - (377 * score) / 100}
                className="text-emerald-500 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
              <span className="text-3xl font-black">{score}%</span>
            </div>
            {loading && (
              <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
                <div className="w-full h-1 bg-emerald-400 shadow-[0_0_8px_3px_rgba(52,211,153,0.5)] animate-scan" />
                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
              </div>
            )}
          </div>
          <h3 className="font-semibold mt-4">{t("Overall Quality Score")}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t("Based on anomaly detection.")}</p>
        </div>

        <div className="md:col-span-2 bg-card border rounded-xl p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b pb-4">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-lg">{t("Detected Anomalies (")}{issues.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[300px]">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">{t("Scanning database...")}</div>
            ) : issues.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <CheckCircle className="w-12 h-12 text-primary mb-3" />
                <p className="text-lg font-medium">{t("No Anomalies Detected")}</p>
                <p className="text-sm text-muted-foreground">{t("Database is structurally sound.")}</p>
              </div>
            ) : (
              <div className="space-y-3 pr-2">
                {issues.map(issue => (
                  <div key={issue.id} className="p-4 border rounded-lg hover:border-muted-foreground/30 transition-colors bg-background/50">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${issue.severity === 'Critical' ? 'text-destructive' : 'text-warning'}`} />
                        <span className="font-semibold text-sm">{issue.entity}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${issue.severity === 'Critical' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-2">{issue.issue}</p>
                    <div className="bg-muted/50 p-2 rounded text-xs flex justify-between items-center">
                      <span className="text-muted-foreground">{t("Fix:")}{issue.recommended_fix}</span>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" onClick={() => {
                        if (issue.quick_action === "View Assignments") {
                          const empId = issue.id.split('-').pop();
                          navigate(`/employees/${empId}`);
                        } else if (issue.quick_action === "Open Team Builder") {
                          navigate('/team-builder');
                        } else {
                          // Placeholder for Send Reminder
                          alert("Reminder sent to employee.");
                        }
                      }}>
                        <Hammer className="w-3 h-3" /> {issue.quick_action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
