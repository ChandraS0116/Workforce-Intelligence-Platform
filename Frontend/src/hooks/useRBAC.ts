import { useAuthStore } from "@/store/useAuthStore";

export type AppModule = 
  | "employees" 
  | "projects" 
  | "dashboard" 
  | "forecasting" 
  | "scenarios" 
  | "teambuilder" 
  | "skills";

export function useRBAC(module: AppModule) {
  const { user } = useAuthStore();
  const role = user?.role || "";

  if (role === "Admin") return { canModify: true, isReadOnly: false };

  // Determine modification access based on role
  let canModify = false;

  switch (role) {
    case "HR Manager":
      canModify = ["employees", "skills"].includes(module);
      break;
    case "Project Manager":
      canModify = ["projects", "teambuilder"].includes(module);
      break;
    case "Delivery Manager":
      canModify = ["forecasting", "scenarios"].includes(module);
      break;
    case "Executive":
      canModify = ["teambuilder", "forecasting", "scenarios"].includes(module);
      break;
    default:
      canModify = false;
  }

  return { canModify, isReadOnly: !canModify };
}
