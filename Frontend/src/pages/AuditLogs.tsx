import { useLanguageStore } from "@/store/useLanguageStore";
import React, { useState, useEffect, useMemo } from "react";
import { Search, Download, Filter, ShieldAlert } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Button, Badge } from "@/components/ui/core";
import * as XLSX from 'xlsx';

export function AuditLogs() {
    const { t } = useLanguageStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showAuth, setShowAuth] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [search]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/audit/logs?limit=100${search ? `&search=${search}` : ''}`);
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const processedLogs = useMemo(() => {
    // 1. Filter out auth spam if needed, and apply category filter
    const filtered = logs.filter(log => {
      const isAuth = log.action.includes("LOGIN") || log.action.includes("LOGOUT");
      if (!showAuth && isAuth) return false;

      if (filter !== "ALL") {
        if (filter === "DATA" && isAuth) return false;
        if (filter === "AUTH" && !isAuth) return false;
        if (filter === "SYSTEM" && log.user_email) return false;
      }
      return true;
    });

    // 2. Deduplicate
    const deduped = [];
    for (const log of filtered) {
      if (deduped.length > 0) {
        const last = deduped[deduped.length - 1];
        if (last.action === log.action && last.entity_type === log.entity_type && last.entity_id === log.entity_id && last.user_email === log.user_email) {
          last.duplicateCount = (last.duplicateCount || 1) + 1;
          continue;
        }
      }
      deduped.push({ ...log, duplicateCount: 1 });
    }
    return deduped;
  }, [logs, filter, showAuth]);

  const getActionBadgeColor = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes("fail") || a.includes("delete") || a.includes("error")) return "destructive";
    if (a.includes("create") || a.includes("add")) return "emerald-500";
    if (a.includes("update") || a.includes("edit")) return "amber-500";
    return "primary";
  };

  const extractUserFromDetails = (log: any) => {
    if (log.user_email && log.user_email !== "System") return log.user_email;
    if (log.details) {
      try {
        const d = JSON.parse(log.details);
        if (d.email) return d.email;
        if (d.user) return d.user;
      } catch (e) {
        if (log.details.includes("email:")) {
          const match = log.details.match(/email:\s*([^\s]+)/);
          if (match && match[1]) return match[1];
        }
      }
    }
    return null;
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(logs.map(log => ({
      Timestamp: new Date(log.created_at).toLocaleString(),
      User: log.user_email,
      Action: log.action,
      Entity: log.entity_type,
      Details: log.details || '-'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");
    XLSX.writeFile(wb, "audit_logs.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Audit Logs")}</h1>
          <p className="text-muted-foreground mt-1">{t("Monitor system activity, user actions, and data modifications.")}</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> {t("Export CSV")}</Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card border rounded-lg p-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("Search by user, action, or entity...")}
            className="w-full pl-9 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex items-center border rounded-md bg-background px-3 h-10">
            <Filter className="w-4 h-4 text-muted-foreground mr-2" />
            <select 
              className="bg-transparent border-none text-sm focus:outline-none focus:ring-0 cursor-pointer text-foreground pr-4"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">{t("All Events")}</option>
              <option value="DATA">{t("Data Changes")}</option>
              <option value="AUTH">{t("Authentication")}</option>
              <option value="SYSTEM">{t("System Events")}</option>
            </select>
          </div>
          <Button 
            variant={showAuth ? "default" : "outline"} 
            className="h-10 text-sm whitespace-nowrap"
            onClick={() => setShowAuth(!showAuth)}
          >
            {showAuth ? "Hide Auth Events" : "Show Auth Events"}
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 font-semibold">{t("Timestamp")}</th>
                <th className="px-6 py-3 font-semibold">{t("User")}</th>
                <th className="px-6 py-3 font-semibold">{t("Action")}</th>
                <th className="px-6 py-3 font-semibold">{t("Entity")}</th>
                <th className="px-6 py-3 font-semibold">{t("Details")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground animate-pulse">{t("Scanning audit history...")}</td>
                </tr>
              ) : processedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    {t("No logs found matching your criteria.")}</td>
                </tr>
              ) : (
                processedLogs.map((log) => {
                  const userIdentifier = extractUserFromDetails(log);
                  return (
                  <React.Fragment key={log.id}>
                  <tr 
                    key={log.id} 
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-mono text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-sm">
                      {userIdentifier ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">
                            {userIdentifier[0].toUpperCase()}
                          </div>
                          {userIdentifier}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic flex items-center gap-1">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                            S
                          </div>
                          {t("System")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-row items-center gap-2 flex-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                          getActionBadgeColor(log.action) === "destructive" ? "bg-destructive/10 text-destructive border border-destructive/20" :
                          getActionBadgeColor(log.action) === "emerald-500" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                          getActionBadgeColor(log.action) === "amber-500" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                          "bg-primary/10 text-primary border border-primary/20"
                        }`}>
                          {log.action}
                        </span>
                        {log.duplicateCount > 1 && (
                          <Badge variant="secondary" className="text-[10px] bg-muted/50 border-muted text-muted-foreground whitespace-nowrap">
                            {log.duplicateCount}x
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm font-medium">
                      {log.entity_type === "User" && !log.entity_id ? (
                        <span className="text-muted-foreground/50">-</span>
                      ) : (
                        <>{log.entity_type} {log.entity_id ? <span className="text-foreground">#{log.entity_id}</span> : ''}</>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs">
                      {log.details ? (() => {
                        try {
                          const d = JSON.parse(log.details);
                          return (
                            <div className="space-y-2">
                              <span className="truncate block text-muted-foreground">{d.message || d.status || d.email || log.details}</span>
                              {(d.ip || d.user_agent) && (
                                <div className="flex gap-2">
                                  {d.ip && <Badge variant="secondary" className="text-[10px] text-muted-foreground bg-muted/50">{t("IP:")}{d.ip}</Badge>}
                                  {d.user_agent && <Badge variant="secondary" className="text-[10px] text-muted-foreground bg-muted/50 truncate max-w-[150px]">{d.user_agent}</Badge>}
                                </div>
                              )}
                            </div>
                          );
                        } catch (e) {
                          return <span className="truncate block text-muted-foreground">{log.details}</span>;
                        }
                      })() : '-'}
                    </td>
                  </tr>
                  {expandedLog === log.id && (
                    <tr key={`expanded-${log.id}`} className="bg-muted/10 border-b">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="text-xs font-mono bg-muted/30 p-4 rounded-lg overflow-x-auto border border-border/50 text-muted-foreground">
                          {log.details ? (() => {
                            try {
                              return JSON.stringify(JSON.parse(log.details), null, 2);
                            } catch {
                              return log.details;
                            }
                          })() : "No additional payload context."}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
