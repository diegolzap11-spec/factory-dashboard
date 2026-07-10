import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, Factory, Truck, Trash2 } from "lucide-react";

export default function Reports() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "custom">("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const startDate = useMemo(() => {
    if (dateRange === "custom" && customStart) return new Date(customStart);
    const d = new Date();
    d.setDate(d.getDate() - (dateRange === "7d" ? 7 : 30));
    return d;
  }, [dateRange, customStart]);

  const endDate = useMemo(() => {
    if (dateRange === "custom" && customEnd) return new Date(customEnd);
    return new Date();
  }, [dateRange, customEnd]);

  const { data: products } = trpc.products.list.useQuery();
  const { data: productionData } = trpc.reports.productionByRange.useQuery({ startDate, endDate });
  const { data: shipmentsData } = trpc.reports.shipmentsByRange.useQuery({ startDate, endDate });
  const { data: consumptionData } = trpc.reports.consumptionByRange.useQuery({ startDate, endDate });

  // Production by product
  const productionByProduct = useMemo(() => {
    if (!productionData || !products) return [];
    return products.map((p) => ({
      name: p.name,
      cantidad: productionData.filter((r) => r.productTypeId === p.id).reduce((sum, r) => sum + r.quantity, 0),
      fill: "#E5A820",
    })).filter((p) => p.cantidad > 0);
  }, [productionData, products]);

  // Shipments by product
  const shipmentsByProduct = useMemo(() => {
    if (!shipmentsData || !products) return [];
    return products.map((p) => ({
      name: p.name,
      cantidad: shipmentsData.filter((r) => r.productTypeId === p.id).reduce((sum, r) => sum + r.quantity, 0),
      fill: "#3B82F6",
    })).filter((p) => p.cantidad > 0);
  }, [shipmentsData, products]);

  // Daily production chart
  const dailyProduction = useMemo(() => {
    if (!productionData) return [];
    const days = {};
    productionData.forEach((p) => {
      const day = new Date(p.date).toLocaleDateString("es-ES", { month: "short", day: "numeric" });
      days[day] = (days[day] || 0) + p.quantity;
    });
    return Object.entries(days).map(([date, cantidad]) => ({ date, cantidad }));
  }, [productionData]);

  // Consumption by category
  const consumptionByCategory = useMemo(() => {
    if (!consumptionData) return [];
    const categories = {};
    consumptionData.forEach((c) => {
      categories[c.categoryId] = (categories[c.categoryId] || 0) + c.bagsConsumed;
    });
    return Object.entries(categories).map(([id, count]) => ({
      name: id === "1" ? "Alta Calidad" : "Baja Calidad",
      bolsas: count as number,
      value: count as number,
    }));
  }, [consumptionData]);

  const totalProduced = productionData?.reduce((sum, p) => sum + p.quantity, 0) || 0;
  const totalShipped = shipmentsData?.reduce((sum, s) => sum + s.quantity, 0) || 0;
  const totalConsumed = consumptionData?.reduce((sum, c) => sum + c.bagsConsumed, 0) || 0;
  const balance = totalProduced - totalShipped;

  const PIE_COLORS = ["#E5A820", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6"];
  const tooltipStyle = {
    backgroundColor: 'rgba(22, 24, 29, 0.95)',
    border: '1px solid rgba(229, 168, 32, 0.2)',
    borderRadius: '12px',
    padding: '8px 12px',
    color: '#f0f0f0',
    fontSize: '13px',
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Reportes</h1>
            <p className="text-sm text-muted-foreground">Análisis de producción, despachos y consumo</p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant={dateRange === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("7d")}
              className={dateRange === "7d" ? "bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl" : "rounded-xl border-border/50 hover:bg-secondary/50 text-foreground"}
            >
              Últimos 7 días
            </Button>
            <Button
              variant={dateRange === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("30d")}
              className={dateRange === "30d" ? "bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl" : "rounded-xl border-border/50 hover:bg-secondary/50 text-foreground"}
            >
              Últimos 30 días
            </Button>
            <Button
              variant={dateRange === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("custom")}
              className={dateRange === "custom" ? "bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl" : "rounded-xl border-border/50 hover:bg-secondary/50 text-foreground"}
            >
              Personalizado
            </Button>
            {dateRange === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="rounded-xl bg-input border border-border/50 px-3 py-2 text-foreground text-sm focus:ring-2 focus:ring-[#E5A820]/30 outline-none"
                />
                <span className="text-muted-foreground">-</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="rounded-xl bg-input border border-border/50 px-3 py-2 text-foreground text-sm focus:ring-2 focus:ring-[#E5A820]/30 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Producido</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Factory className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">{totalProduced}</div>
              <p className="text-xs text-muted-foreground mt-1">Unidades en el período</p>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Despachado</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                <Truck className="h-4 w-4 text-[#3B82F6]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#3B82F6]">{totalShipped}</div>
              <p className="text-xs text-muted-foreground mt-1">Unidades en el período</p>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${balance >= 0 ? 'bg-[#10B981]/10' : 'bg-[#EF4444]/10'}`}>
                {balance >= 0 ? <TrendingUp className="h-4 w-4 text-[#10B981]" /> : <TrendingDown className="h-4 w-4 text-[#EF4444]" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${balance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{balance > 0 ? `+${balance}` : balance}</div>
              <p className="text-xs text-muted-foreground mt-1">Diferencia producción vs despacho</p>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Consumo Insumos</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-[#8B5CF6]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#8B5CF6]">{totalConsumed}</div>
              <p className="text-xs text-muted-foreground mt-1">Bolsas (25 kg c/u) en el período</p>
            </CardContent>
          </Card>
        </div>

        {/* Production by Product Chart */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
              <CardTitle className="text-foreground">Producción por Producto</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionByProduct}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="cantidad" fill="#E5A820" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Shipments by Product Chart */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[#3B82F6]" />
              <CardTitle className="text-foreground">Despachos por Producto</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={shipmentsByProduct}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="cantidad" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Daily Production */}
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
                <CardTitle className="text-foreground">Producción Diaria</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyProduction}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="cantidad" fill="#E5A820" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Consumption Pie */}
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[#8B5CF6]" />
                <CardTitle className="text-foreground">Consumo por Categoría</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={consumptionByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {consumptionByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              {consumptionByCategory.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Sin datos de consumo en este período
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
