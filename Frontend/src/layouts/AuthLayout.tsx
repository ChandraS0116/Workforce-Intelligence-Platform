import { useLanguageStore } from "@/store/useLanguageStore";
import { Outlet } from "react-router-dom";

export function AuthLayout() {
    const { t } = useLanguageStore();
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Visual / Brand Side */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-primary relative overflow-hidden flex-col justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/60 mix-blend-multiply" />
        {/* Abstract animated grid or chart elements could go here */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 text-primary-foreground max-w-xl">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            {t("Workforce Intelligence Platform")}</h1>
          <p className="text-lg text-primary-foreground/80 leading-relaxed">
            {t("Premium AI-driven decision support for enterprise workforce planning, team chemistry optimization, and predictive delivery analytics.")}</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
