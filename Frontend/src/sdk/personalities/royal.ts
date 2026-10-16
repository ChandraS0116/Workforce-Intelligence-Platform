import type { IPersonalityConfig } from "../types";

export const royalPersonality: IPersonalityConfig = {
  id: "royal",
  metadata: {
    name: "Royal Analytics",
    description: "Luxurious, high-contrast premium dashboard with gold accents.",
    type: "luxury"
  },
  colors: {
    background: "230 40% 10%", // Deep Navy
    foreground: "45 100% 85%", // Soft Gold
    card: "230 40% 15%",
    cardForeground: "45 100% 85%",
    border: "45 50% 30%",
    primary: "45 100% 60%", // Gold
    primaryForeground: "230 40% 10%",
    accent: "260 80% 60%", // Royal Purple
    accentForeground: "0 0% 100%",
    muted: "230 40% 20%",
    mutedForeground: "45 50% 60%",
    destructive: "0 80% 50%",
    success: "45 100% 60%",
    warning: "30 100% 50%",
    glassTint: "rgba(10, 15, 30, 0.7)",
    glowIntensity: "0px 15px 40px rgba(255, 215, 0, 0.15)",
    mapOcean: "#0f172a",
    mapLand: "#1e293b"
  },
  motion: {
    durationFast: "400ms",
    durationSlow: "1200ms",
    easingElastic: "cubic-bezier(0.4, 0, 0.2, 1)",
    easingSmooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    easingLinear: "linear",
    dragResistance: 0.8,
    hoverScale: 1.02
  },
  layout: {
    spacingBase: "0.75rem",
    cardPadding: "2rem",
    sidebarWidth: "20rem",
    borderRadius: "16px"
  },
  charts: {
    gridOpacity: 0.05,
    strokeWidth: 4,
    areaFillOpacity: 0.5,
    neonGlow: true, // Used for gold shimmer
    palette: [
      "45 100% 60%", // Gold
      "260 80% 60%", // Royal Purple
      "200 80% 60%", // Sky Blue
      "330 80% 60%", // Magenta
      "0 0% 90%"     // Silver
    ]
  },
  network3D: {
    backgroundColor: "#0a0f1e",
    nodeGlow: true,
    linkColor: "rgba(255, 215, 0, 0.3)",
    environment: "clean",
    bloomStrength: 0.8
  },
  typography: {
    fontFamily: "'Manrope', sans-serif",
    headingWeight: "800"
  }
};
