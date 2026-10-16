import { useLanguageStore } from "@/store/useLanguageStore";
import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/core";
import { apiClient } from "@/lib/apiClient";
import { usePersonalityStore } from "@/store/usePersonalityStore";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const indiaGeoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json";

export function GlobalTalentHeatmap() {
    const { t } = useLanguageStore();
  const [locations, setLocations] = useState<any[]>([]);
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });
  const { config } = usePersonalityStore();

  useEffect(() => {
    apiClient.get("/ml/intelligence/locations").then(res => setLocations(res.data)).catch(console.error);
  }, []);

  return (
    <Card className="col-span-full shadow-lg border-border bg-card text-foreground overflow-hidden" style={{ boxShadow: config.colors.glowIntensity }}>
      <CardHeader className="border-b border-border bg-muted/10" style={{ backgroundColor: config.colors.glassTint }}>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <span className="text-xl">🗺️</span> {t("Global Talent Heatmap")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("Real-time geographic distribution of your workforce and capacity metrics.")}</p>
      </CardHeader>
      <CardContent className="p-0 flex flex-col md:flex-row h-[450px]">
        {/* Map Area */}
        <div className="flex-1 relative cursor-move">
          <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120, center: [0, 20] }} width={800} height={450}>
            <ZoomableGroup 
              zoom={position.zoom} 
              center={position.coordinates as [number, number]} 
              onMoveEnd={setPosition} 
              minZoom={1} 
              maxZoom={8}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={`hsl(${config.colors.mutedForeground})`} // Using muted foreground for base map
                      stroke={`hsl(${config.colors.border})`} 
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", opacity: 0.2 },
                        hover: { fill: `hsl(${config.colors.primary})`, outline: "none", cursor: "pointer", opacity: 0.5 },
                        pressed: { fill: `hsl(${config.colors.primary})`, outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>
              <Geographies geography={indiaGeoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <g key={geo.rsmKey}>
                      <Geography
                        geography={geo}
                        fill={`hsl(var(--card))`} // Solid erase layer for underlying disputes
                        stroke="none"
                        style={{ default: { outline: "none", opacity: 1 } }}
                      />
                      <Geography
                        geography={geo}
                        fill={`hsl(${config.colors.mutedForeground})`} 
                        stroke={`hsl(${config.colors.border})`} 
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none", opacity: 0.2 },
                          hover: { fill: `hsl(${config.colors.primary})`, outline: "none", cursor: "pointer", opacity: 0.5 },
                          pressed: { fill: `hsl(${config.colors.primary})`, outline: "none" },
                        }}
                      />
                    </g>
                  ))
                }
              </Geographies>
              {locations.map(({ id, name, coordinates }) => (
                <Marker key={id} coordinates={coordinates}>
                  <text
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    style={{ 
                      fontFamily: `var(--font-${config.typography.fontFamily})`, 
                      fill: `hsl(${config.colors.primary})`, 
                      fontSize: 8 / position.zoom, 
                      fontWeight: "700", 
                      textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)" 
                    }}
                  >
                    {name}
                  </text>
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Legend / Metrics Panel */}
        <div className="w-full md:w-64 bg-background/50 p-4 overflow-y-auto backdrop-blur-sm border-l border-border space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">{t("Location Intelligence")}</h3>
          {locations.map(loc => (
            <div key={loc.id} className="bg-muted/10 rounded-lg p-3 border border-border hover:bg-muted/20 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-foreground">{loc.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${loc.risk === 'High' ? 'bg-destructive/20 text-destructive' : loc.risk === 'Medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                  {loc.risk} {t("Risk")}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between"><span>{t("Headcount:")}</span> <span className="font-mono text-foreground">{loc.employees}</span></div>
                <div className="flex justify-between"><span>{t("Utilization:")}</span> <span className="font-mono text-foreground">{loc.utilization}%</span></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
