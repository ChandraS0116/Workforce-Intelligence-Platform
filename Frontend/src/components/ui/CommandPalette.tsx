import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";

export function CommandPalette() {
    const { t } = useLanguageStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    const debounce = setTimeout(() => fetchResults(), 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[20vh]">
      <div 
        className="w-full max-w-2xl bg-card border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            className="flex h-14 w-full rounded-md bg-transparent py-3 px-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={t("Search employees, projects, skills...")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <Loader2 className="w-5 h-5 text-muted-foreground animate-spin shrink-0" />}
          <div className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground ml-2 shrink-0">{t("ESC")}</div>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 && query.length >= 2 && !loading && (
            <div className="py-14 text-center text-sm text-muted-foreground">
              {t("No results found for \"")}{query}"
            </div>
          )}
          {results.length === 0 && query.length < 2 && (
            <div className="py-14 text-center text-sm text-muted-foreground">
              {t("Start typing to search...")}</div>
          )}
          
          <div className="space-y-1">
            {results.map((item, index) => (
              <button
                key={`${item.type}-${item.id}-${index}`}
                onClick={() => {
                  navigate(item.link);
                  setOpen(false);
                }}
                className="w-full flex flex-col items-start px-3 py-2 hover:bg-accent hover:text-accent-foreground rounded-md text-left transition-colors"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-sm">{item.title}</span>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{item.type}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Background overlay click to close */}
      <div className="fixed inset-0 -z-10" onClick={() => setOpen(false)} />
    </div>
  );
}
