import { useLanguageStore } from "@/store/useLanguageStore";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui/core";
import { exportToPDF, exportToExcel } from "@/lib/exportUtils";

export function Forecasting() {
    const { t } = useLanguageStore();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await apiClient.get('/ml/intelligence/forecast');
        setData(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchForecast();
  }, []);

  const doExportPDF = () => {
    if (!data || !data.forecasts) return;
    exportToPDF("Workforce Forecast Report", 
      ["Horizon", "Total Demand", "Hiring Demand", "Utilization"],
      Object.keys(data.forecasts).map(k => [
        k.toUpperCase(), 
        data.forecasts[k].total_demand,
        data.forecasts[k].hiring_demand,
        `${data.forecasts[k].utilization_forecast}%`
      ])
    );
  };

  const doExportExcel = () => {
    if (!data || !data.forecasts) return;
    exportToExcel("Workforce Forecast", Object.keys(data.forecasts).map(k => ({
      Horizon: k.toUpperCase(),
      TotalDemand: data.forecasts[k].total_demand,
      HiringDemand: data.forecasts[k].hiring_demand,
      Utilization: data.forecasts[k].utilization_forecast
    })));
  };

  if (!data) return <div className="p-8 text-center animate-pulse">{t("Running predictive forecast models...")}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Workforce Forecasting")}</h1>
          <p className="text-muted-foreground">{t("30/90/180/365 day headcount and capacity projections.")}</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={doExportExcel}>{t("Export to Excel")}</Button>
          <Button variant="outline" onClick={doExportPDF}>{t("Export to PDF")}</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.keys(data.forecasts).map((horizonKey) => {
          const hz = data.forecasts[horizonKey];
          const label = horizonKey.replace('_', ' ').toUpperCase();
          return (
            <Card key={horizonKey} className="bg-muted/10">
              <CardHeader>
                <CardTitle className="text-lg text-primary">{label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("Hiring Demand")}</p>
                  <p className="text-2xl font-bold">{hz.hiring_demand}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("Capacity Forecast")}</p>
                  <p className="text-xl font-semibold">{hz.capacity_forecast} {t("hrs")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("Total Demand")}</p>
                  <p className="text-xl font-semibold">{hz.total_demand} {t("hrs")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("Skill Shortage")}</p>
                  <p className="text-sm font-medium">{hz.skill_shortage.join(', ')}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("Est. Utilization")}</p>
                    <p className={`text-xl font-semibold ${hz.utilization_forecast > 95 ? 'text-destructive' : 'text-emerald-500'}`}>
                      {hz.utilization_forecast}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("Delivery Risk")}</p>
                    <p className={`text-xl font-semibold ${hz.delivery_risk > 50 ? 'text-destructive' : 'text-primary'}`}>
                      {hz.delivery_risk}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
