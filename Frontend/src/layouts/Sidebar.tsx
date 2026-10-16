import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Wand2, 
  Briefcase, 
  TrendingUp, 
  LineChart, 
  Network, 
  Settings2,
  ShieldAlert,
  Crown,
  FileSpreadsheet,
  Database,
  Clock,
  BrainCircuit,
  Target,
  DollarSign,
  GanttChartSquare
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";

// Add roles to NAV_ITEMS
const NAV_ITEMS = [
  { name: "Executive Command Center", path: "/executive", icon: Crown, roles: ["Admin", "HR Manager", "Project Manager", "Delivery Manager"] },
  { name: "Portfolio Command Center", path: "/command-center", icon: LayoutDashboard, roles: ["Admin", "Project Manager", "Delivery Manager"] },
  { name: "Operational Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "HR Manager", "Project Manager", "Delivery Manager"] },
  { name: "Employee Intelligence", path: "/employees", icon: Users, roles: ["Admin", "HR Manager", "Project Manager"] },
  { name: "Smart Team Builder", path: "/team-builder", icon: Wand2, roles: ["Admin", "Project Manager"] },
  { name: "Project Portfolio", path: "/projects", icon: Briefcase, roles: ["Admin", "Project Manager", "Delivery Manager"] },
  { name: "Skill Gap Analysis", path: "/skill-gap", icon: TrendingUp, roles: ["Admin", "HR Manager"] },
  { name: "Workforce Forecast", path: "/forecasting", icon: LineChart, roles: ["Admin", "HR Manager", "Delivery Manager"] },
  { name: "Team Chemistry", path: "/chemistry", icon: Network, roles: ["Admin", "HR Manager", "Project Manager"] },
  { name: "Scenario Simulator", path: "/simulator", icon: Settings2, roles: ["Admin", "Delivery Manager"] },
  { name: "Reporting Center", path: "/reporting", icon: FileSpreadsheet, roles: ["Admin", "HR Manager", "Delivery Manager"] },
  { name: "Data Quality Center", path: "/data-quality", icon: Database, roles: ["Admin"] },
  { name: "Activity Timeline", path: "/activity", icon: Clock, roles: ["Admin"] },
  { name: "Audit Logs", path: "/audit", icon: ShieldAlert, roles: ["Admin"] },
  { name: "3D Org Network", path: "/intelligence/ona", icon: BrainCircuit, roles: ["Admin", "Executive"] },
  { name: "Talent Matrix", path: "/intelligence/talent-grid", icon: Target, roles: ["Admin", "HR Manager", "Executive"] },
  { name: "Resource Conflicts", path: "/intelligence/conflicts", icon: GanttChartSquare, roles: ["Admin", "Project Manager", "Executive"] },
  { name: "Compensation Risk", path: "/intelligence/compensation", icon: DollarSign, roles: ["Admin", "HR Manager", "Executive"] },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const userRole = user?.role || "Admin";

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-64 border-r bg-card flex flex-col hidden md:flex shrink-0 transition-colors duration-300">
      <div className="h-16 flex items-center px-6 border-b">
        <div className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-primary-foreground" />
          </div>
          {t("Workforce AI")}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-6 px-3">
        <nav className="space-y-1.5">
          {filteredNav.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {t(item.name)}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
