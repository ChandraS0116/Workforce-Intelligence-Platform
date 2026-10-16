import type { IPersonalityConfig } from "../types";

export const executivePersonality: IPersonalityConfig = {
  id: "executive",
  metadata: {
    name: "Executive Command",
    description: "Premium, calm, corporate dashboard optimized for C-suite presentations.",
    type: "executive"
  },
  colors: {
    background: "220 20% 98%", // Light gray/blue
    foreground: "220 40% 10%",
    card: "0 0% 100%",
    cardForeground: "220 40% 10%",
    border: "220 15% 90%",
    primary: "160 80% 30%", // Deep Emerald
    primaryForeground: "0 0% 100%",
    accent: "45 100% 50%", // Gold
    accentForeground: "0 0% 100%",
    muted: "220 15% 95%",
    mutedForeground: "220 15% 40%",
    destructive: "0 80% 50%",
    success: "160 80% 30%",
    warning: "40 90% 50%",
    glassTint: "rgba(255, 255, 255, 0.8)",
    glowIntensity: "0px 10px 30px rgba(0, 0, 0, 0.05)",
    mapOcean: "#f8fafc",
    mapLand: "#e2e8f0"
  },
  motion: {
    durationFast: "300ms",
    durationSlow: "800ms",
    easingElastic: "ease-in-out",
    easingSmooth: "ease-in-out",
    easingLinear: "linear",
    dragResistance: 0.5,
    hoverScale: 1.01
  },
  layout: {
    spacingBase: "0.5rem",
    cardPadding: "1.5rem",
    sidebarWidth: "18rem",
    borderRadius: "12px"
  },
  charts: {
    gridOpacity: 0.1,
    strokeWidth: 2,
    areaFillOpacity: 0.3,
    neonGlow: false,
    palette: [
      "160 80% 30%", // Emerald
      "45 100% 50%", // Gold
      "220 80% 40%", // Deep Blue
      "180 40% 50%", // Teal
      "20 80% 50%"   // Rust
    ]
  },
  network3D: {
    backgroundColor: "#ffffff",
    nodeGlow: false,
    linkColor: "rgba(0, 0, 0, 0.1)",
    environment: "clean",
    bloomStrength: 0
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    headingWeight: "600"
  }
};
