import { useEffect } from "react";
import { usePersonalityStore } from "@/store/usePersonalityStore";

export function PersonalityProvider({ children }: { children: React.ReactNode }) {
  const config = usePersonalityStore((state) => state.config);

  useEffect(() => {
    if (!config) return;

    const root = document.documentElement;
    
    // Inject Colors as CSS Variables (assuming HSL for tailwind)
    root.style.setProperty('--background', config.colors.background);
    root.style.setProperty('--foreground', config.colors.foreground);
    root.style.setProperty('--card', config.colors.card);
    root.style.setProperty('--card-foreground', config.colors.cardForeground);
    root.style.setProperty('--border', config.colors.border);
    root.style.setProperty('--primary', config.colors.primary);
    root.style.setProperty('--primary-foreground', config.colors.primaryForeground);
    root.style.setProperty('--accent', config.colors.accent);
    root.style.setProperty('--accent-foreground', config.colors.accentForeground);
    root.style.setProperty('--muted', config.colors.muted);
    root.style.setProperty('--muted-foreground', config.colors.mutedForeground);
    root.style.setProperty('--success', config.colors.success);
    root.style.setProperty('--warning', config.colors.warning);
    
    // Visualization specifically
    root.style.setProperty('--viz-glow', config.colors.glowIntensity);
    root.style.setProperty('--glass-tint', config.colors.glassTint);
    config.charts.palette.forEach((color, i) => {
      root.style.setProperty(`--chart-${i+1}`, color);
    });

    // Layout
    root.style.setProperty('--layout-spacing', config.layout.spacingBase);
    root.style.setProperty('--layout-padding', config.layout.cardPadding);
    root.style.setProperty('--radius', config.layout.borderRadius);

    // Typography (we also need to dynamically inject a Google Font link if it doesn't exist)
    root.style.setProperty('--font-sans', config.typography.fontFamily);
    
    const fontName = config.typography.fontFamily.split(',')[0].replace(/['"]/g, '');
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap`;
    
    let link = document.getElementById('personality-font') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = 'personality-font';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    if (link.href !== fontUrl) {
      link.href = fontUrl;
    }

  }, [config]);

  return <>{children}</>;
}
