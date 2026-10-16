import { registerPersonality } from "../personalityEngine";
import { cyberPersonality } from "./cyber";
import { executivePersonality } from "./executive";
import { royalPersonality } from "./royal";
import type { IPersonalityConfig } from "../types";

// Base registration
registerPersonality(cyberPersonality);
registerPersonality(executivePersonality);
registerPersonality(royalPersonality);

// Helper to quickly spin up the remaining 12 themes using the executive as a structural base
// but with completely different color and typography variables.
function createThemeVariant(
  id: string, name: string, type: any, isDark: boolean,
  bg: string, card: string, primary: string, accent: string, 
  env: any, font: string, mapOcean: string
): IPersonalityConfig {
  const foreground = isDark ? "210 20% 98%" : "220 40% 10%";
  const cardForeground = isDark ? "210 20% 98%" : "220 40% 10%";
  const mutedForeground = isDark ? "210 20% 65%" : "220 15% 40%";
  const border = isDark ? "210 20% 25%" : "220 15% 90%";
  const muted = isDark ? "210 20% 20%" : "220 15% 95%";
  const glassTint = isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.8)";
  const mapLand = isDark ? "#1e293b" : "#e2e8f0";

  return {
    ...executivePersonality,
    id,
    metadata: { ...executivePersonality.metadata, name, type, description: `The ${name} personality.` },
    colors: {
      ...executivePersonality.colors,
      background: bg,
      foreground,
      card,
      cardForeground,
      muted,
      mutedForeground,
      border,
      glassTint,
      primary,
      accent,
      mapOcean,
      mapLand
    },
    network3D: { ...executivePersonality.network3D, environment: env },
    typography: { ...executivePersonality.typography, fontFamily: font }
  };
}

registerPersonality(createThemeVariant("arctic", "Arctic Intelligence", "minimal", false, "210 20% 98%", "0 0% 100%", "200 90% 40%", "210 40% 80%", "clean", "'Inter', sans-serif", "#f0f9ff"));
registerPersonality(createThemeVariant("space", "Space Command", "tactical", true, "0 0% 2%", "0 0% 6%", "280 80% 60%", "200 100% 50%", "stars", "'Orbitron', sans-serif", "#020617"));
registerPersonality(createThemeVariant("ocean", "Ocean Intelligence", "executive", true, "220 80% 10%", "220 80% 15%", "180 80% 40%", "150 80% 40%", "fog", "'Outfit', sans-serif", "#082f49"));
registerPersonality(createThemeVariant("graphite", "Graphite Analytics", "technical", true, "220 10% 15%", "220 10% 20%", "220 10% 60%", "220 10% 80%", "clean", "'Roboto Mono', monospace", "#1e293b"));
registerPersonality(createThemeVariant("forest", "Forest Operations", "executive", true, "140 40% 10%", "140 40% 15%", "120 40% 40%", "80 60% 40%", "volumetric", "'Plus Jakarta Sans', sans-serif", "#064e3b"));
registerPersonality(createThemeVariant("solar", "Solar Command", "luxury", false, "40 20% 95%", "40 20% 98%", "30 90% 50%", "10 90% 50%", "clean", "'Outfit', sans-serif", "#fffbeb"));
registerPersonality(createThemeVariant("crimson", "Crimson Carbon", "tactical", true, "0 0% 8%", "0 0% 12%", "0 80% 50%", "0 0% 40%", "particles", "'Inter', sans-serif", "#2a0000"));
registerPersonality(createThemeVariant("aurora", "Aurora Operations", "technical", true, "270 40% 10%", "270 40% 15%", "150 80% 50%", "300 80% 50%", "fog", "'Outfit', sans-serif", "#2e1065"));
registerPersonality(createThemeVariant("desert", "Desert Intelligence", "minimal", false, "30 20% 90%", "30 20% 95%", "20 60% 40%", "40 60% 40%", "clean", "'Manrope', sans-serif", "#fef3c7"));
registerPersonality(createThemeVariant("obsidian", "Obsidian Gold", "luxury", true, "0 0% 4%", "0 0% 8%", "45 100% 50%", "0 0% 80%", "stars", "'Manrope', sans-serif", "#000000"));
registerPersonality(createThemeVariant("lavender", "Lavender Platinum", "minimal", false, "260 20% 95%", "260 20% 98%", "260 40% 60%", "200 40% 60%", "clean", "'Inter', sans-serif", "#f5f3ff"));
registerPersonality(createThemeVariant("titanium", "Titanium Operations", "technical", true, "210 20% 20%", "210 20% 25%", "200 80% 50%", "0 0% 80%", "clean", "'Roboto Mono', monospace", "#0f172a"));

// --- New Variety Themes ---
registerPersonality(createThemeVariant("neon", "Neon Synthwave", "tactical", true, "280 100% 10%", "280 100% 15%", "320 100% 50%", "190 100% 50%", "particles", "'Orbitron', sans-serif", "#2e004f"));
registerPersonality(createThemeVariant("matcha", "Matcha Zen", "minimal", false, "100 20% 95%", "100 20% 98%", "110 40% 40%", "140 30% 60%", "clean", "'Outfit', sans-serif", "#ecfdf5"));
registerPersonality(createThemeVariant("sunset", "Sunset Horizon", "executive", true, "15 50% 15%", "15 50% 20%", "25 90% 50%", "320 80% 60%", "fog", "'Manrope', sans-serif", "#431407"));
registerPersonality(createThemeVariant("midnight", "Midnight Velvet", "luxury", true, "250 50% 8%", "250 50% 12%", "45 100% 50%", "250 80% 60%", "stars", "'Plus Jakarta Sans', sans-serif", "#1e1b4b"));
registerPersonality(createThemeVariant("cyberpunk", "Cyberpunk Edge", "tactical", true, "60 100% 5%", "60 100% 8%", "60 100% 50%", "180 100% 50%", "particles", "'Roboto Mono', monospace", "#1a1c00"));
