import { useLanguageStore } from "@/store/useLanguageStore";
import { AlertCircle } from "lucide-react";

export function ReadOnlyBanner() {
    const { t } = useLanguageStore();
  return (
    <div className="bg-primary/10 border border-primary/20 text-primary rounded-md p-3 mb-6 flex items-center gap-3 text-sm">
      <AlertCircle className="w-5 h-5" />
      <p>
        <strong>{t("Read-Only Access.")}</strong> {t("You have view access to this module but cannot modify data or perform actions based on your current role.")}</p>
    </div>
  );
}
