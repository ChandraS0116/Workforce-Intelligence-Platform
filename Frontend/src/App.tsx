import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "./layouts/AuthLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Dashboard } from "./pages/Dashboard";
import { TeamBuilder } from "./pages/TeamBuilder";
import { SkillGap } from "./pages/SkillGap";
import { Employees } from "./pages/Employees";
import { EmployeeDetails } from "./pages/EmployeeDetails";
import { Projects } from "./pages/Projects";
import { ProjectDetails } from "./pages/ProjectDetails";
import { TeamChemistry } from "./pages/TeamChemistry";
import { ScenarioSimulator } from "./pages/ScenarioSimulator";
import { AuditLogs } from "./pages/AuditLogs";
import { Executive } from "./pages/Executive";
import { Reporting } from "./pages/Reporting";
import { DataQuality } from "./pages/DataQuality";
import { ActivityTimeline } from "./pages/ActivityTimeline";
import { CommandPalette } from './components/ui/CommandPalette';
import { Forecasting } from "./pages/Forecasting";
import { PortfolioCommandCenter } from "./pages/PortfolioCommandCenter";
import { OrganizationNetwork } from "./pages/OrganizationNetwork";
import { TalentGrid } from "./pages/TalentGrid";
import { ResourceConflicts } from "./pages/ResourceConflicts";
import { CompensationMatrix } from "./pages/CompensationMatrix";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PersonalityProvider } from "./components/PersonalityProvider";
export default function App() {
  return (
    <PersonalityProvider>
      <BrowserRouter>
        <CommandPalette />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/command-center" replace />} />
            <Route path="/command-center" element={<PortfolioCommandCenter />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/team-builder" element={<TeamBuilder />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/skill-gap" element={<SkillGap />} />
            <Route path="/forecasting" element={<Forecasting />} />
            <Route path="/chemistry" element={<TeamChemistry />} />
            <Route path="/simulator" element={<ScenarioSimulator />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/executive" element={<Executive />} />
            <Route path="/reporting" element={<Reporting />} />
            <Route path="/data-quality" element={<DataQuality />} />
            <Route path="/activity" element={<ActivityTimeline />} />
            <Route path="/intelligence/ona" element={<OrganizationNetwork />} />
            <Route path="/intelligence/talent-grid" element={<TalentGrid />} />
            <Route path="/intelligence/conflicts" element={<ResourceConflicts />} />
            <Route path="/intelligence/compensation" element={<CompensationMatrix />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
    </PersonalityProvider>
  );
}
