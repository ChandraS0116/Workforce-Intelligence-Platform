export interface IPersonalityConfig {
  id: string;
  metadata: {
    name: string;
    description: string;
    type: "tactical" | "executive" | "technical" | "luxury" | "minimal";
  };
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    border: string;
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    destructive: string;
    success: string;
    warning: string;
    glassTint: string;
    glowIntensity: string; // "0px 0px 0px rgba(...)"
    mapOcean: string;
    mapLand: string;
  };
  motion: {
    durationFast: string;
    durationSlow: string;
    easingElastic: string;
    easingSmooth: string;
    easingLinear: string;
    dragResistance: number;
    hoverScale: number;
  };
  layout: {
    spacingBase: string;
    cardPadding: string;
    sidebarWidth: string;
    borderRadius: string;
  };
  charts: {
    gridOpacity: number;
    strokeWidth: number;
    areaFillOpacity: number;
    neonGlow: boolean;
    palette: string[]; // [chart-1, chart-2, chart-3, chart-4, chart-5]
  };
  network3D: {
    backgroundColor: string;
    nodeGlow: boolean;
    linkColor: string;
    environment: "particles" | "fog" | "stars" | "volumetric" | "clean";
    fogDensity?: number;
    bloomStrength?: number;
  };
  typography: {
    fontFamily: string;
    headingWeight: string;
  };
}
