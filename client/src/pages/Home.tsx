import DashboardLayout from "@/components/DashboardLayout";
import { HELMET_PRODUCTS } from "../const";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Factory, Truck, TrendingUp, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useMemo } from "react";

export default function Home() {
  const { data: allProduction, refetch: refetchProduction } = trpc.production.getAll.useQuery();
  const { data: allShipments, refetch: refetchShipments } = trpc.shipments.getAll.useQuery();
  const { data: products } = trpc.products.list.useQuery();
  const { data: allStock, refetch: refetchStock } = trpc.stock.getAll.useQuery();

  useEffect(() => {
    const interval = setInterval(() => {
      refetchProduction();
      refetchShipments();
      refetchStock();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetchProduction, refetchShipments, refetchStock]);

  // Calcular producción del día por tipo de producto
  const todayProduction = useMemo(() => {
    if (!allProduction) return { cascoJockey: 0, cascoMinero: 0, mascarillas: 0 };
    
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    
    const todayRecords = allProduction.filter(
      (p) => new Date(p.date).toISOString().split("T")[0] === todayStr
    );

    const getProductionByName = (name: string) => {
      const product = products?.find((p) => p.name.toLowerCase().includes(name.toLowerCase()));
      if (!product) return 0;
      return todayRecords
        .filter((p) => p.productTypeId === product.id)
        .reduce((sum, p) => sum + p.quantity, 0);
    };

    return {
      cascoJockey: getProductionByName("Jockey"),
      cascoMinero: getProductionByName("Minero"),
      mascarillas: getProductionByName("Mascarilla"),
    };
  }, [allProduction, products]);

  // Calcular despachos del día
  const todayShipments = useMemo(() => {
    if (!allShipments) return 0;
    
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    
    return allShipments
      .filter((s) => new Date(s.date).toISOString().split("T")[0] === todayStr)
      .reduce((sum, s) => sum + s.quantity, 0);
  }, [allShipments]);

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
        date: new Date(day).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
        cantidad: dayProduction.reduce((sum, p) => sum + p.quantity, 0),
      };
    });
  }, [allProduction]);

  // Calcular stock total por producto
  const stockByProduct = useMemo(() => {
    if (!allStock || !products) return {};
    
    const stock: Record<string, number> = {};
    products.forEach((product) => {
      stock[product.id] = allStock
        .filter((s) => s.productTypeId === product.id)
        .reduce((sum, s) => sum + s.quantity, 0);
    });
    return stock;
  }, [allStock, products]);

  const customTooltipStyle = {
    backgroundColor: 'rgba(23, 25, 35, 0.95)',
    border: '1px solid rgba(229, 168, 32, 0.2)',
    borderRadius: '12px',
    padding: '8px 12px',
    color: '#f0f0f0',
    fontSize: '13px',
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel de Control</h1>
          <p className="text-muted-foreground text-sm">Flexo Impress — Monitoreo en tiempo real de producción y despachos</p>
        </div>

        {/* Stock Actual */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
            <h2 className="text-lg font-semibold text-foreground">Stock Actual</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3 stagger-children">
            {products?.map((product) => {
              const stock = stockByProduct[product.id] || 0;
              return (
                <Card key={product.id} className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{product.name}</CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-[#E5A820]" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#E5A820]">{stock}</div>
                    <p className="text-xs text-muted-foreground mt-1">Unidades en stock</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Producción del Día */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
            <h2 className="text-lg font-semibold text-foreground">Producción del Día</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3 stagger-children">
            <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Casco Jockey I</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                  <Factory className="h-4 w-4 text-[#E5A820]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#E5A820]">{todayProduction.cascoJockey}</div>
                <p className="text-xs text-muted-foreground mt-1">Unidades producidas hoy</p>
              </CardContent>
            </Card>

            <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Casco Minero</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                  <Factory className="h-4 w-4 text-[#E5A820]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#E5A820]">{todayProduction.cascoMinero}</div>
                <p className="text-xs text-muted-foreground mt-1">Unidades producidas hoy</p>
              </CardContent>
            </Card>

            <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Mascarillas Tipo AS</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                  <Factory className="h-4 w-4 text-[#E5A820]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#E5A820]">{todayProduction.mascarillas}</div>
                <p className="text-xs text-muted-foreground mt-1">Unidades producidas hoy</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Despachos del Día */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
            <h2 className="text-lg font-semibold text-foreground">Despachos del Día</h2>
          </div>
          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Despachos Hoy</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Truck className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">{todayShipments}</div>
              <p className="text-xs text-muted-foreground mt-1">Unidades despachadas hoy</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Producción */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#E5A820]" />
              <CardTitle className="text-foreground">Producción - Últimos 7 Días</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Cantidad total de unidades producidas por día</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(229, 168, 32, 0.05)' }} />
                <Bar dataKey="cantidad" fill="#E5A820" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
