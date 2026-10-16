import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui/core";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Loader2 } from "lucide-react";
import { useRBAC } from "@/hooks/useRBAC";
import { ReadOnlyBanner } from "@/components/ReadOnlyBanner";

export function Employees() {
    const { t } = useLanguageStore();
  const { canModify, isReadOnly } = useRBAC("employees");
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    role: "",
    hire_date: new Date().toISOString().split('T')[0],
    department_id: ""
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, [searchQuery, departmentFilter]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (departmentFilter && departmentFilter !== "all") params.append("department_id", departmentFilter);
      
      const res = await apiClient.get(`/employees?${params.toString()}`);
      let allEmps = res.data || [];
      
      try {
        const customEmps = JSON.parse(localStorage.getItem("mesh_custom_employees") || "[]");
        for (const cEmp of customEmps) {
          if (!allEmps.some((e: any) => e.name.toLowerCase() === cEmp.name.toLowerCase())) {
            if (!searchQuery || cEmp.name.toLowerCase().includes(searchQuery.toLowerCase()) || cEmp.email.toLowerCase().includes(searchQuery.toLowerCase())) {
              allEmps.unshift(cEmp);
            }
          }
        }
      } catch (err) {
        console.error("Local storage merge error", err);
      }

      setEmployees(allEmps);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to load employees. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/employees', {
        ...newEmployee,
        department_id: parseInt(newEmployee.department_id) || 1
      });
      setShowAddModal(false);
      setNewEmployee({ name: "", email: "", role: "", hire_date: new Date().toISOString().split('T')[0], department_id: "" });
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert("Failed to add employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    if (roleFilter && roleFilter !== "all" && !emp.role.toLowerCase().includes(roleFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {isReadOnly && <ReadOnlyBanner />}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Employees")}</h1>
          <p className="text-muted-foreground">{t("Manage organizational workforce data.")}</p>
        </div>
        {canModify && <Button onClick={() => setShowAddModal(true)}>{t("Add Employee")}</Button>}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-[400px] shadow-2xl relative">
            <CardHeader><CardTitle>{t("Add Employee")}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t("Name")}</label>
                  <Input required value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} placeholder={t("John Doe")} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("Email")}</label>
                  <Input required type="email" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} placeholder={t("john@company.com")} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("Role")}</label>
                  <Input required value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})} placeholder={t("e.g. Senior Developer")} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("Hire Date")}</label>
                  <Input required type="date" value={newEmployee.hire_date} onChange={e => setNewEmployee({...newEmployee, hire_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("Department ID")}</label>
                  <Input required type="number" value={newEmployee.department_id} onChange={e => setNewEmployee({...newEmployee, department_id: e.target.value})} placeholder={t("e.g. 1")} />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setShowAddModal(false)}>{t("Cancel")}</Button>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t("Submit")}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>{t("Employee Directory")}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("Search employees...")}
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative w-40">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("Role filter...")}
                  className="pl-9"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                />
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
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <h3 className="mt-2 text-sm font-semibold">{t("No employees found")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("Try adjusting your search or filters.")}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEmployees.map((emp) => (
                <div key={emp.id} className="flex flex-col justify-between p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => navigate(`/employees/${emp.id}`)}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {emp.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold group-hover:text-primary transition-colors">{emp.display_name || emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.role}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-4">{emp.email}</div>
                  <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); navigate(`/employees/${emp.id}`); }}>{t("View Profile")}</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
