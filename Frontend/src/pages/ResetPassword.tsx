import { useLanguageStore } from "@/store/useLanguageStore";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Input } from "@/components/ui/core";

export function ResetPassword() {
    const { t } = useLanguageStore();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const { apiClient } = await import("@/lib/apiClient");
      const res = await apiClient.post("/auth/reset-password", { 
        token, 
        new_password: password 
      });
      setMessage(res.data.message);
      setStatus("success");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "An error occurred.");
      setStatus("error");
    }
  };

  if (!token && status !== "success") {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{t("Invalid Link")}</h2>
        <p className="text-muted-foreground">{t("The password reset link is invalid or has expired.")}</p>
        <Link to="/forgot-password">
          <Button className="w-full">{t("Request New Link")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{t("Create New Password")}</h2>
        <p className="text-muted-foreground mt-2">
          {t("Enter your new password below.")}</p>
      </div>

      {status === "success" ? (
        <div className="p-4 bg-success/10 text-success rounded-md text-center">
          {message}
          <p className="text-sm mt-2">{t("Redirecting to login...")}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === "error" && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {message}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">{t("New Password")}</label>
            <Input 
              type="password" 
              placeholder={t("••••••••")} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </div>
  );
}
