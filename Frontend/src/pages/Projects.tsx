import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/core";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Plus, X } from "lucide-react";
import { useRBAC } from "@/hooks/useRBAC";
import { ReadOnlyBanner } from "@/components/ReadOnlyBanner";

export function Projects() {
    const { t } = useLanguageStore();
  const { canModify, isReadOnly } = useRBAC("projects");
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add Project Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    status: t("Active"),
    start_date: new Date().toISOString().split('T')[0],
    manager_id: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, [statusFilter]);

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get('/employees');
      setEmployees(res.data);
    } catch (e) {
      console.error("Failed to load employees for manager selection", e);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      
      const res = await apiClient.get(`/projects?${params.toString()}`);
      setProjects(res.data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to load projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/projects", {
        ...newProject,
        manager_id: parseInt(newProject.manager_id)
      });
      setIsAddModalOpen(false);
      setNewProject({ name: "", status: t("Active"), start_date: new Date().toISOString().split('T')[0], manager_id: "" });
      fetchProjects();
    } catch (e) {
      console.error(e);
      alert("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {isReadOnly && <ReadOnlyBanner />}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Project Portfolio")}</h1>
          <p className="text-muted-foreground">{t("Monitor ongoing initiatives and workforce allocations.")}</p>
        </div>
        {canModify && (
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> {t("New Project")}</Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>{t("Active Portfolio")}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("Search projects...")}
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Filter by status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("All Statuses")}</SelectItem>
                    <SelectItem value="Active">{t("Active")}</SelectItem>
                    <SelectItem value="Completed">{t("Completed")}</SelectItem>
                    <SelectItem value="On Hold">{t("On Hold")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && <div className="p-4 mb-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">{error}</div>}

          {loading ? (
             <div className="flex justify-center items-center py-12">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <h3 className="mt-2 text-sm font-semibold">{t("No projects found")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("Try adjusting your search or filters.")}</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">{t("Project Name")}</th>
                    <th className="px-4 py-3 text-left font-medium">{t("Status")}</th>
                    <th className="px-4 py-3 text-left font-medium">{t("Start Date")}</th>
                    <th className="px-4 py-3 text-left font-medium">{t("End Date")}</th>
                    <th className="px-4 py-3 text-right font-medium">{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((proj) => (
                    <tr key={proj.id} className="border-t hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-semibold cursor-pointer text-primary" onClick={() => navigate(`/projects/${proj.id}`)}>
                        {proj.name}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={proj.status === 'Active' ? 'default' : proj.status === 'Completed' ? 'secondary' : 'outline'}>
                          {proj.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{new Date(proj.start_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{proj.end_date ? new Date(proj.end_date).toLocaleDateString() : 'Ongoing'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${proj.id}`)}>{t("Details")}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border rounded-xl shadow-lg w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">{t("Create New Project")}</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Project Name")}</label>
                <Input 
                  placeholder={t("e.g. Project Phoenix")} 
                  value={newProject.name} 
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Status")}</label>
                <Select value={newProject.status} onValueChange={(val: string) => setNewProject({...newProject, status: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">{t("Active")}</SelectItem>
                    <SelectItem value="On Hold">{t("On Hold")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Start Date")}</label>
                <Input 
                  type="date" 
                  value={newProject.start_date} 
                  onChange={(e) => setNewProject({...newProject, start_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Project Manager")}</label>
                <Select value={newProject.manager_id} onValueChange={(val: string) => setNewProject({...newProject, manager_id: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select Manager")} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>{emp.display_name || emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>{t("Cancel")}</Button>
              <Button 
                onClick={handleCreateProject} 
                disabled={isSubmitting || !newProject.name || !newProject.manager_id}
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
