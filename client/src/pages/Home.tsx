import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Factory, Truck, Package, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import { APP_NAME, HELMET_COLORS, COLOR_HEX_MAP, getProductImage } from "../const";

export default function Home() {
  const { data: allProduction } = trpc.production.getAll.useQuery();
  const { data: allShipments } = trpc.shipments.getAll.useQuery();
  const { data: products } = trpc.products.list.useQuery();
  const { data: allStock } = trpc.stock.getAll.useQuery();

  // Identificar IDs de los productos del casco
  const cascoJockeyProduct = useMemo(() => {
    return products?.find((p) => p.name === "Casco Jockey I");
  }, [products]);

  const cascoMineroProduct = useMemo(() => {
    return products?.find((p) => p.name === "Casco Minero");
  }, [products]);

  // Calcular producción del día por casco
  const todayProduction = useMemo(() => {
    if (!allProduction || !products) return { cascoJockey: 0, cascoMinero: 0 };

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const todayRecords = allProduction.filter(
      (p) => new Date(p.date).toISOString().split("T")[0] === todayStr
    );

    return {
      cascoJockey: todayRecords
        .filter((p) => p.productTypeId === cascoJockeyProduct?.id)
        .reduce((sum, p) => sum + p.quantity, 0),
      cascoMinero: todayRecords
        .filter((p) => p.productTypeId === cascoMineroProduct?.id)
        .reduce((sum, p) => sum + p.quantity, 0),
    };
  }, [allProduction, products, cascoJockeyProduct, cascoMineroProduct]);

  // Calcular despachos del día
  const todayShipments = useMemo(() => {
    if (!allShipments) return 0;

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    return allShipments
      .filter((s) => new Date(s.date).toISOString().split("T")[0] === todayStr)
      .reduce((sum, s) => sum + s.quantity, 0);
  }, [allShipments]);

  // Stock por casco y color
  const stockByHelmet = useMemo(() => {
    if (!allStock || !cascoJockeyProduct || !cascoMineroProduct)
      return { cascoJockey: {}, cascoMinero: {} };

    const jockeyStock = allStock.filter(
      (s) => s.productTypeId === cascoJockeyProduct.id
    );
    const mineroStock = allStock.filter(
      (s) => s.productTypeId === cascoMineroProduct.id
    );

    const jockeyMap: Record<string, number> = {};
    const mineroMap: Record<string, number> = {};

    HELMET_COLORS.forEach((color) => {
      const jockeyItem = jockeyStock.find(
        (s) => s.color.toLowerCase() === color.toLowerCase()
      );
      jockeyMap[color] = jockeyItem?.quantity || 0;

      const mineroItem = mineroStock.find(
        (s) => s.color.toLowerCase() === color.toLowerCase()
      );
      mineroMap[color] = mineroItem?.quantity || 0;
    });

    return { cascoJockey: jockeyMap, cascoMinero: mineroMap };
  }, [allStock, cascoJockeyProduct, cascoMineroProduct]);

  // Totales de stock
  const totalStockJockey = Object.values(stockByHelmet.cascoJockey).reduce(
    (a, b) => a + b,
    0
  );
  const totalStockMinero = Object.values(stockByHelmet.cascoMinero).reduce(
    (a, b) => a + b,
    0
  );

  // Datos para gráfico de producción últimos 7 días
  const productionChartData = useMemo(() => {
    if (!allProduction) return [];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    return last7Days.map((day) => {
      const dayProduction = allProduction.filter(
        (p) => new Date(p.date).toISOString().split("T")[0] === day
      );
      return {
        date: new Date(day).toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
        }),
        cantidad: dayProduction.reduce((sum, p) => sum + p.quantity, 0),
      };
    });
  }, [allProduction]);

  const customTooltipStyle = {
    backgroundColor: "rgba(22, 24, 29, 0.95)",
    border: "1px solid rgba(229, 168, 32, 0.2)",
    borderRadius: "12px",
    padding: "8px 12px",
    color: "#f0f0f0",
    fontSize: "13px",
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Panel de Control
          </h1>
          <p className="text-muted-foreground text-sm">
            {APP_NAME} — Monitoreo en tiempo real de producción, despachos y
            stock
          </p>
        </div>

        {/* Producción y Despachos del Día */}
        <div className="grid gap-4 md:grid-cols-3 stagger-children">
          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Producción Hoy — Casco Jockey I
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Factory className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">
                {todayProduction.cascoJockey}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unidades producidas hoy
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Producción Hoy — Casco Minero
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Factory className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">
                {todayProduction.cascoMinero}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unidades producidas hoy
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Despachos Hoy
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                <Truck className="h-4 w-4 text-[#3B82F6]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#3B82F6]">
                {todayShipments}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unidades despachadas hoy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stock por Casco y Color */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
            <h2 className="text-lg font-semibold text-foreground">
              Stock Actual
            </h2>
          </div>

          {/* Stock Casco Jockey I */}
          <Card className="card-premium gold-line-bottom overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-foreground">
                Casco Jockey I
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Total en stock:{" "}
                <span className="font-bold text-[#E5A820]">
                  {totalStockJockey}
                </span>
              </p>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
                {HELMET_COLORS.map((color) => (
                  <div
                    key={color}
                    className="flex items-center justify-between p-2.5 bg-secondary/40 rounded-xl border border-border/30"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-border/50 shadow-sm"
                        style={{
                          backgroundColor:
                            COLOR_HEX_MAP[color] || color.toLowerCase(),
                        }}
                      />
                      <span className="text-xs font-medium text-foreground capitalize">
                        {color}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#E5A820]">
                      {stockByHelmet.cascoJockey[color] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stock Casco Minero */}
          <Card className="card-premium gold-line-bottom overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-foreground">
                Casco Minero
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Total en stock:{" "}
                <span className="font-bold text-[#E5A820]">
                  {totalStockMinero}
                </span>
              </p>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
                {HELMET_COLORS.map((color) => (
                  <div
                    key={color}
                    className="flex items-center justify-between p-2.5 bg-secondary/40 rounded-xl border border-border/30"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-border/50 shadow-sm"
                        style={{
                          backgroundColor:
                            COLOR_HEX_MAP[color] || color.toLowerCase(),
                        }}
                      />
                      <span className="text-xs font-medium text-foreground capitalize">
                        {color}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#E5A820]">
                      {stockByHelmet.cascoMinero[color] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Producción */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
              <CardTitle className="text-foreground">
                Producción — Últimos 7 Días
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Cantidad total de unidades producidas por día
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  cursor={{ fill: "rgba(229, 168, 32, 0.05)" }}
                />
                <Bar
                  dataKey="cantidad"
                  fill="#E5A820"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
