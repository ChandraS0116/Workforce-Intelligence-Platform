import { useLanguageStore } from "@/store/useLanguageStore";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input } from "@/components/ui/core";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/lib/apiClient";

export function Login() {
    const { t } = useLanguageStore();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [email, setEmail] = useState("admin@company.com");
  const [password, setPassword] = useState("password123");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      const { access_token, user } = response.data;
      login(user, access_token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{t("Sign In")}</h2>
        <p className="text-muted-foreground mt-2">
          {t("Access the Workforce Intelligence Platform")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">{t("Email Address")}</label>
          <Input 
            type="email" 
            placeholder={t("admin@company.com")} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none">{t("Password")}</label>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              {t("Forgot password?")}</Link>
          </div>
          <Input 
            type="password" 
            placeholder={t("••••••••")} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="remember" className="rounded border-input text-primary focus:ring-primary" />
          <label htmlFor="remember" className="text-sm text-muted-foreground">
            {t("Remember me for 30 days")}</label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Authenticating..." : "Sign In to Dashboard"}
        </Button>
      </form>
    </div>
  );
}
