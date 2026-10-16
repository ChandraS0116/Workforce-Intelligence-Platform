import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine, ReferenceArea } from 'recharts';
import { DollarSign, TrendingDown, CheckCircle2 } from "lucide-react";
import { usePersonalityStore } from "@/store/usePersonalityStore";

export function CompensationMatrix() {
    const { t } = useLanguageStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [appliedPoints, setAppliedPoints] = useState<Record<string, boolean>>({});
  const { config } = usePersonalityStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/intelligence/compensation');
        setData(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-xl" style={{ boxShadow: config.colors.glowIntensity }}>
          <p className="text-xs font-bold text-foreground mb-1">{d.name}</p>
          <p className="text-[10px] text-muted-foreground">{t("Compa-Ratio:")}{d.compa_ratio}</p>
          <p className="text-[10px] text-muted-foreground">{t("Flight Risk:")}{d.risk_score}%</p>
          <p className="text-[10px] text-success mt-2">{t("ECA: ₹")}{(d.eca).toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-6 bg-background overflow-hidden">
      
      {/* Matrix Area */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{t("Compensation Risk Optimization")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("Expected Cost of Attrition (ECA) vs Market Compa-Ratio Matrix.")}</p>
          </div>
        </div>

        {loading ? (
           <div className="flex-1 flex justify-center items-center"><div className="animate-pulse text-muted-foreground font-mono">{t("Calculating Pareto Frontier...")}</div></div>
        ) : (
          <div className="flex-1 bg-muted/10 border border-border rounded-xl p-6 shadow-inner relative" style={{ backgroundColor: config.colors.glassTint }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={config.charts.gridOpacity} />
                <XAxis 
                  type="number" 
                  dataKey="compa_ratio" 
                  name="Compa-Ratio" 
                  domain={[0.5, 1.5]} 
                  stroke={`hsl(${config.colors.mutedForeground})`}
                  label={{ value: 'Compa-Ratio (Base / Market Midpoint)', position: 'bottom', fill: `hsl(${config.colors.mutedForeground})`, fontSize: 12 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="risk_score" 
                  name="Flight Risk" 
                  domain={[0, 100]} 
                  stroke={`hsl(${config.colors.mutedForeground})`}
                  label={{ value: 'Flight Risk Prediction (%)', angle: -90, position: 'left', fill: `hsl(${config.colors.mutedForeground})`, fontSize: 12 }}
                />
                
                {/* Danger Zone Reference Area */}
                <ReferenceArea x1={0.5} x2={0.9} y1={70} y2={100} fill={`hsl(${config.colors.destructive})`} fillOpacity={0.05} strokeOpacity={0} />
                <ReferenceLine x={1.0} stroke={`hsl(${config.colors.success})`} strokeOpacity={0.3} strokeDasharray="3 3" />
                <ReferenceLine y={50} stroke={`hsl(${config.colors.border})`} strokeOpacity={0.5} strokeDasharray="3 3" />

                <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: `hsl(${config.colors.border})` }} />
                
                <Scatter 
                  name="Workforce" 
                  data={data} 
                  onClick={(e) => setSelectedPoint(e.payload)}
                  className="cursor-pointer"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.compa_ratio < 0.9 && entry.risk_score > 70 ? `hsl(${config.colors.destructive})` : entry.compa_ratio >= 1.0 ? `hsl(${config.colors.success})` : `hsl(${config.colors.primary})`} 
                      opacity={selectedPoint?.id === entry.id ? 1 : 0.6}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            
            <div className="absolute top-0 left-20 p-2 bg-transparent text-destructive font-bold text-xs uppercase tracking-widest pointer-events-none z-20">
              {t("Danger Zone (High ROI Interventions)")}</div>
          </div>
        )}
      </div>

      {/* Decision Intelligence Panel */}
      <div className="w-96 border-l border-border bg-card/95 backdrop-blur-3xl p-6 overflow-y-auto shrink-0" style={{ boxShadow: config.colors.glowIntensity }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-success/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-success" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">{t("Financial ROI Engine")}</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mt-1">{t("Marginal Return on Compensation")}</p>
          </div>
        </div>

        {selectedPoint ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            
            <div className="flex items-center gap-4 border-b border-border pb-4">
              <div className="w-12 h-12 rounded-full bg-muted border-2 border-border flex items-center justify-center text-lg text-foreground font-bold">
                {selectedPoint.name[selectedPoint.name.length - 1]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedPoint.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedPoint.department}</p>
              </div>
            </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-muted/40 rounded-lg border border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t("Base Salary")}</p>
                  <p className="text-sm font-mono text-foreground">₹{selectedPoint.base_salary.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-muted/40 rounded-lg border border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t("Market Midpoint")}</p>
                  <p className="text-sm font-mono text-foreground">₹{selectedPoint.market_mid.toLocaleString()}</p>
                </div>
              </div>

            <div className="p-4 bg-background border border-border rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{t("Compa-Ratio (CR)")}</span>
                <span className={`text-sm font-mono font-bold ${selectedPoint.compa_ratio < 0.9 ? 'text-destructive' : 'text-success'}`}>
                  {selectedPoint.compa_ratio}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{t("Flight Risk (P_attrition)")}</span>
                <span className={`text-sm font-mono font-bold ${selectedPoint.risk_score > 70 ? 'text-destructive' : 'text-foreground'}`}>
                  {selectedPoint.risk_score}%
                </span>
              </div>
                <div className="p-3 bg-background rounded-lg border border-destructive/20 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t("Expected Cost of Attrition")}</p>
                  <p className="text-2xl font-bold font-mono text-destructive">
                    ₹{selectedPoint.eca.toLocaleString()}
                  </p>
                </div>
            </div>

            {selectedPoint.compa_ratio < 0.9 && selectedPoint.risk_score > 70 && (
              <div className="p-4 border border-success/30">
                <div className="space-y-3 mb-4">
                   <div className="p-3 bg-background rounded border border-success/40 relative overflow-hidden">
                     <div className="absolute right-0 top-0 bottom-0 w-1 bg-success/60"></div>
                     <p className="text-xs text-foreground font-semibold mb-1">{t("Option A: Merit Intervention")}</p>
                     <p className="text-[10px] text-muted-foreground leading-relaxed">
                       {t("Market Adjustment of")}<strong>₹15,000</strong>. 
                     </p>
                     <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                       {t("This shifts CR → 0.96, reducing risk mathematically to 15%. Expected savings (ECA_current - ECA_new) =")}<strong>₹{(selectedPoint.eca - (selectedPoint.market_mid * 1.5 * 0.15)).toLocaleString(undefined, {maximumFractionDigits: 0})}</strong>.
                     </p>
                   </div>
                </div>
                <button 
                  onClick={() => {
                    const newEca = selectedPoint.market_mid * 1.5 * 0.15;
                    const updatedPoint = {
                      ...selectedPoint,
                      compa_ratio: 0.96,
                      risk_score: 15.0,
                      eca: Math.round(newEca)
                    };
                    setSelectedPoint(updatedPoint);
                    setData(data.map(d => d.name === selectedPoint.name ? updatedPoint : d));
                    setAppliedPoints({...appliedPoints, [selectedPoint.name]: true});
                  }}
                  disabled={appliedPoints[selectedPoint.name]}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                    appliedPoints[selectedPoint.name] 
                      ? 'bg-emerald-600 hover:bg-emerald-600 text-white cursor-default' 
                      : 'bg-success/20 hover:bg-success/30 text-success'
                  }`}
                >
                  {appliedPoints[selectedPoint.name] ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> {t("Applied")}
                    </>
                  ) : (
                    t("Apply Gradient Ascent Optimization")
                  )}
                </button>
              </div>
            )}
            
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <TrendingDown className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("Select a node to calculate Marginal Return on Compensation (MROC) and Expected Cost of Attrition (ECA).")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
