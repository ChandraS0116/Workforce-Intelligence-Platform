import type { IPersonalityConfig } from "../types";

export const cyberPersonality: IPersonalityConfig = {
  id: "cyber",
  metadata: {
    name: "Cyber Operations",
    description: "High-contrast tactical dashboard with neon accents and particle environments.",
    type: "tactical"
  },
  colors: {
    background: "0 0% 0%", // HSL variables
    foreground: "180 100% 90%",
    card: "0 0% 4%",
    cardForeground: "180 100% 90%",
    border: "180 100% 20%",
    primary: "180 100% 50%", // Cyan
    primaryForeground: "0 0% 0%",
    accent: "120 100% 50%", // Neon Green
    accentForeground: "0 0% 0%",
    muted: "180 50% 15%",
    mutedForeground: "180 50% 60%",
    destructive: "340 100% 50%",
    success: "120 100% 50%",
    warning: "40 100% 50%",
    glassTint: "rgba(0, 255, 255, 0.05)",
    glowIntensity: "0px 0px 20px rgba(0, 255, 255, 0.4)",
    mapOcean: "#000000",
    mapLand: "#001a1a"
  },
  motion: {
    durationFast: "150ms",
    durationSlow: "400ms",
    easingElastic: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    easingSmooth: "ease-out",
    easingLinear: "linear",
    dragResistance: 0.1,
    hoverScale: 1.05
  },
  layout: {
    spacingBase: "0.25rem",
    cardPadding: "1rem",
    sidebarWidth: "16rem",
    borderRadius: "0px"
  },
  charts: {
    gridOpacity: 0.8,
    strokeWidth: 3,
    areaFillOpacity: 0.1,
    neonGlow: true,
    palette: [
      "180 100% 50%", // Cyan
      "120 100% 50%", // Neon Green
      "280 100% 60%", // Neon Purple
      "340 100% 50%", // Neon Pink
      "40 100% 50%"   // Neon Orange
    ]
  },
  network3D: {
    backgroundColor: "#000000",
    nodeGlow: true,
    linkColor: "rgba(0, 255, 255, 0.5)",
    environment: "particles",
    bloomStrength: 1.5
  },
  typography: {
    fontFamily: "'IBM Plex Mono', monospace",
    headingWeight: "700"
  }
};
