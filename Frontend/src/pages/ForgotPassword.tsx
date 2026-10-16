import { useLanguageStore } from "@/store/useLanguageStore";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input } from "@/components/ui/core";

export function ForgotPassword() {
    const { t } = useLanguageStore();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const { apiClient } = await import("@/lib/apiClient");
      const res = await apiClient.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
      // For MVP testing only: Log the token to console so we can reset it easily
      if (res.data.mvp_dev_token) {
        console.log("MVP DEV TOKEN:", res.data.mvp_dev_token);
        setMessage(res.data.message + " (Check console for MVP dev token)");
      }
      setStatus("success");
    } catch (err: any) {
      setMessage("An error occurred. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{t("Reset Password")}</h2>
        <p className="text-muted-foreground mt-2">
          {t("Enter your email to receive a reset link")}</p>
      </div>

      {status === "success" ? (
        <div className="space-y-4">
          <div className="p-4 bg-success/10 text-success rounded-md">
            {message}
          </div>
          <Link to="/login" className="block text-center text-sm text-primary hover:underline">
            {t("Return to Login")}</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === "error" && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {message}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">{t("Email Address")}</label>
            <Input 
              type="email" 
              placeholder={t("you@company.com")} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
              {t("Back to Sign In")}</Link>
          </div>
        </form>
      )}
    </div>
  );
}
