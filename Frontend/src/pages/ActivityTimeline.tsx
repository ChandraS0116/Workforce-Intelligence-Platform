import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect, useMemo } from "react";
import { Activity as ActivityIcon, Users, Settings, Briefcase, TrendingUp, Clock, Search } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Input, Button, Card, CardContent, Badge } from "@/components/ui/core";

export function ActivityTimeline() {
    const { t } = useLanguageStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiClient.get('/audit/logs?limit=100');
        setLogs(res.data);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const baseFilter = logs.filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (log.user?.name && log.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterType === "ALL" || log.entity_type.includes(filterType) || log.action.includes(filterType);
      return matchesSearch && matchesFilter;
    });

    const deduped = [];
    for (const log of baseFilter) {
      if (deduped.length > 0) {
        const last = deduped[deduped.length - 1];
        if (last.action === log.action && last.entity_type === log.entity_type && last.entity_id === log.entity_id && last.details === log.details) {
          last.duplicateCount = (last.duplicateCount || 1) + 1;
          continue;
        }
      }
      deduped.push({ ...log, duplicateCount: 1 });
    }
    return deduped;
  }, [logs, searchTerm, filterType]);

  const groupedLogs = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredLogs.forEach(log => {
      const d = new Date(log.created_at);
      const today = new Date();
      const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      const isYesterday = new Date(today.setDate(today.getDate() - 1)).getDate() === d.getDate();
      
      let dateKey = d.toLocaleDateString();
      if (isToday) dateKey = "Today";
      else if (isYesterday) dateKey = "Yesterday";

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [filteredLogs]);

  const getIcon = (action: string) => {
    if (action.includes("TEAM") || action.includes("EMPLOYEE")) return <Users className="w-4 h-4 text-primary" />;
    if (action.includes("PROJECT")) return <Briefcase className="w-4 h-4 text-amber-500" />;
    if (action.includes("SETTINGS")) return <Settings className="w-4 h-4 text-muted-foreground" />;
    if (action.includes("INTELLIGENCE") || action.includes("FORECAST")) return <TrendingUp className="w-4 h-4 text-primary" />;
    return <ActivityIcon className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Activity Timeline")}</h1>
          <p className="text-muted-foreground mt-1">{t("Real-time organizational events and platform usage.")}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t("Search activity, users, or modules...")} 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {["ALL", "EMPLOYEE", "PROJECT", "SYSTEM"].map(f => (
            <Button 
              key={f} 
              variant={filterType === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(f)}
              className="whitespace-nowrap"
            >
              {f === "ALL" ? "All Activity" : f}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative pl-6">
        <div className="absolute top-0 bottom-0 left-2.5 w-px bg-border" />
        
        {loading ? (
          <div className="py-8 text-center text-muted-foreground animate-pulse">{t("Loading activity...")}</div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">{t("Failed to load activity timeline.")}</div>
        ) : Object.keys(groupedLogs).length === 0 ? (
          <div className="py-12 text-center text-muted-foreground flex flex-col items-center bg-card border rounded-xl shadow-sm">
            <Clock className="w-12 h-12 mb-3 text-muted" />
            <p className="text-lg font-medium">{t("No activity found")}</p>
            <p className="text-sm">{t("Try adjusting your search or filters.")}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.keys(groupedLogs).map((dateKey) => (
              <div key={dateKey} className="relative">
                <div className="sticky top-4 z-20 mb-4 inline-block">
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold shadow-sm border bg-background text-foreground">
                    {dateKey}
                  </Badge>
                </div>
                <div className="space-y-6">
                  {groupedLogs[dateKey].map((log: any) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-6 w-5 h-5 rounded-full bg-background border flex items-center justify-center z-10 shadow-sm ring-4 ring-background">
                        {getIcon(log.action)}
                      </div>
                      <Card className="shadow-sm hover:shadow-md transition-all hover:border-primary/50 group">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm group-hover:text-primary transition-colors">{log.user?.name || "System"}</span>
                              <Badge variant="outline" className="text-[10px] font-mono tracking-tighter uppercase">{log.action}</Badge>
                              {log.duplicateCount > 1 && (
                                <Badge variant="secondary" className="text-[10px] bg-muted/50 border-none">{log.duplicateCount} {t("repeated events")}</Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium bg-muted/50 px-2 py-1 rounded">
                              <Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90 mt-2">
                            {log.details ? (() => {
                              try {
                                const d = JSON.parse(log.details);
                                return (
                                  <div className="space-y-2">
                                    <span>{d.message || d.status || d.email || log.action}</span>
                                    {(d.ip || d.user_agent) && (
                                      <div className="flex gap-2 mt-2">
                                        {d.ip && <Badge variant="secondary" className="text-[10px] text-muted-foreground bg-muted/50">{t("IP:")}{d.ip}</Badge>}
                                        {d.user_agent && <Badge variant="secondary" className="text-[10px] text-muted-foreground bg-muted/50">{d.user_agent}</Badge>}
                                      </div>
                                    )}
                                  </div>
                                );
                              } catch (e) {
                                return log.details;
                              }
                            })() : `Executed ${log.action} on ${log.entity_type} #${log.entity_id || ''}`}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
