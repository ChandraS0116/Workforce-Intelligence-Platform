import { useState, useEffect } from "react";
import { Search, Bell, LogOut, Palette, Check, Globe } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePersonalityStore } from "@/store/usePersonalityStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Button } from "@/components/ui/core";
import { apiClient } from "@/lib/apiClient";

export function Header() {
  const { user, logout } = useAuthStore();
  const { activeId, config, availablePersonalities, setPersonality } = usePersonalityStore();
  const { language, setLanguage, t } = useLanguageStore();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await apiClient.get('/notifications');
        setNotifications(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchNotifs();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: number) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 transition-colors duration-300">
      <div className="flex-1 max-w-md relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <div className="pl-9 h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background flex items-center text-muted-foreground cursor-pointer" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
          {t("Search")} <span className="ml-auto text-xs border rounded px-1.5 bg-muted">{t("Ctrl+K")}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="hidden sm:flex gap-2">
            <Globe className="w-4 h-4" />
            <span className="capitalize">{language}</span>
          </Button>
          {showLanguageMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-background border rounded-lg shadow-xl py-2 z-50 max-h-[400px] overflow-y-auto">
              <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("Language")}</div>
              {["English", "Telugu", "Arabic", "German", "French"].map((lang) => (
                <button 
                  key={lang}
                  onClick={() => { setLanguage(lang); setShowLanguageMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                >
                  <span className="capitalize">{lang}</span>
                  {language === lang && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setShowThemeMenu(!showThemeMenu)} className="hidden sm:flex gap-2">
            <Palette className="w-4 h-4" />
            <span className="capitalize">{config?.metadata.name || t('Loading...')}</span>
          </Button>
          {showThemeMenu && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-background border rounded-lg shadow-xl py-2 z-50 max-h-[400px] overflow-y-auto">
              <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("Workspace Personalities")}</div>
              {availablePersonalities.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => { setPersonality(p.id); setShowThemeMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                >
                  <span className="capitalize">{p.metadata.name}</span>
                  {activeId === p.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            )}
          </Button>
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-background border rounded-lg shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b flex items-center justify-between">
                <span className="font-semibold">{t("Notifications")}</span>
                <span className="text-xs text-muted-foreground">{unreadCount} {t("unread")}</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">{t("No alerts")}</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-4 border-b last:border-0 hover:bg-muted/50 cursor-pointer ${!n.is_read ? 'bg-primary/5' : ''}`} onClick={() => markAsRead(n.id)}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold uppercase ${n.severity === 'critical' ? 'text-destructive' : n.severity === 'warning' ? 'text-amber-500' : 'text-primary'}`}>{n.severity}</span>
                        <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-border mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium leading-none">{t(user?.name || 'Demo Admin')}</div>
            <div className="text-xs text-muted-foreground mt-1">{t(user?.role || 'System Administrator')}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <Button variant="ghost" size="icon" onClick={async () => {
            try { await apiClient.post('/auth/logout'); } catch (e) {}
            logout();
          }} title={t("Log out")}>
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}
