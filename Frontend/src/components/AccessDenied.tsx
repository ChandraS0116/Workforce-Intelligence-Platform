import { useLanguageStore } from "@/store/useLanguageStore";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/core";

export function AccessDenied() {
    const { t } = useLanguageStore();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
      <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t("Access Denied")}</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        {t("You do not have the required permissions to view this administrative page. Please contact your enterprise administrator if you believe this is an error.")}</p>
      <Link to="/dashboard">
        <Button>{t("Return to Dashboard")}</Button>
      </Link>
    </div>
  );
}
