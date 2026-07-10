import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";
import { Factory, Truck, Package, Trash2, TrendingUp, TrendingDown, Box } from "lucide-react";
import { HELMET_PRODUCTS, HELMET_COLORS } from "../const";
import { useMemo } from "react";

export default function Reports() {
  const { data: products } = trpc.products.list.useQuery();
  const { data: allProduction } = trpc.production.getAll.useQuery();
  const { data: allShipments } = trpc.shipments.getAll.useQuery();
  const { data: allConsumption } = trpc.consumption.getAll.useQuery();

  const form = useForm({});

  const helmetProducts = products?.filter((p) =>
    HELMET_PRODUCTS.includes(p.name as (typeof HELMET_PRODUCTS)[number])
  );

  const reportData = useMemo(() => {
    const totalProduced = allProduction?.reduce((sum, p) => sum + p.quantity, 0) || 0;
    const totalDispatched = allShipments?.reduce((sum, s) => sum + s.quantity, 0) || 0;
    const balance = totalProduced - totalDispatched;

    const totalBagsConsumed = allConsumption?.reduce((sum, c) => sum + c.bagsConsumed, 0) || 0;
    const totalKgConsumed = totalBagsConsumed * 25;

    // Production by product and color
    const productionByProduct: Record<string, Record<string, number>> = {};
    allProduction?.forEach((p) => {
      const productName = products?.find((pr) => pr.id === p.productTypeId)?.name || "Desconocido";
      if (!productionByProduct[productName]) {
        productionByProduct[productName] = {};
      }
      const color = p.color || "Sin color";
      productionByProduct[productName][color] = (productionByProduct[productName][color] || 0) + p.quantity;
    });

    // Shipments by product and color
    const shipmentsByProduct: Record<string, Record<string, number>> = {};
    allShipments?.forEach((s) => {
      const productName = products?.find((pr) => pr.id === s.productTypeId)?.name || "Desconocido";
      if (!shipmentsByProduct[productName]) {
        shipmentsByProduct[productName] = {};
      }
      const color = s.color || "Sin color";
      shipmentsByProduct[productName][color] = (shipmentsByProduct[productName][color] || 0) + s.quantity;
    });

    // Stock by product and color
    const stockByProduct: Record<string, Record<string, number>> = {};
    for (const [productName, production] of Object.entries(productionByProduct)) {
      stockByProduct[productName] = {};
      for (const [color, qty] of Object.entries(production)) {
        const shipped = shipmentsByProduct[productName]?.[color] || 0;
        stockByProduct[productName][color] = qty - shipped;
      }
    }

    return {
      totalProduced,
      totalDispatched,
      balance,
      totalBagsConsumed,
      totalKgConsumed,
      productionByProduct,
      shipmentsByProduct,
      stockByProduct,
    };
  }, [allProduction, allShipments, allConsumption, products]);

  const { totalProduced, totalDispatched, balance, totalBagsConsumed, totalKgConsumed, stockByProduct } = reportData;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Reportes
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen general de producción, despachos, balance y consumo de insumos
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 stagger-children">
          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Producido
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Factory className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">
                {totalProduced}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unidades producidas en total
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Despachado
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Truck className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">
                {totalDispatched}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unidades despachadas en total
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Balance
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${balance >= 0 ? "text-[#E5A820]" : "text-red-500"}`}>
                {balance >= 0 ? `+${balance}` : balance}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {balance >= 0 ? "Stock positivo" : "Stock negativo"}
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Consumo
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">
                {totalBagsConsumed}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalKgConsumed} kg consumidos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stock Detail Table */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
              <CardTitle className="text-foreground">
                Stock por Producto y Color
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Desglose del stock actual por cada casco y color
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 bg-secondary/30">
                    <TableHead className="text-muted-foreground font-medium">
                      Casco
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Color
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Producido
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Despachado
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Stock Actual
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {helmetProducts?.map((product) => (
                    <>
                      {HELMET_COLORS.map((color) => {
                        const stock = stockByProduct[product.name]?.[color] || 0;
                        const produced = Object.values(
                          reportData.productionByProduct[product.name] || {}
                        ).reduce((sum, v) => sum + v, 0);
                        const dispatched = Object.values(
                          reportData.shipmentsByProduct[product.name] || {}
                        ).reduce((sum, v) => sum + v, 0);
                        return (
                          <TableRow
                            key={`${product.name}-${color}`}
                            className="border-border/20 hover:bg-secondary/20 transition-colors"
                          >
                            <TableCell className="text-foreground font-medium">
                              {product.name}
                            </TableCell>
                            <TableCell className="text-foreground capitalize">
                              {color}
                            </TableCell>
                            <TableCell className="text-[#E5A820] font-bold">
                              {produced}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {dispatched}
                            </TableCell>
                            <TableCell className="font-bold">
                              <span className={stock >= 0 ? "text-[#E5A820]" : "text-red-500"}>
                                {stock >= 0 ? stock : stock}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Summary */}
        <div className="grid gap-4 md:grid-cols-2 stagger-children">
          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
                <CardTitle className="text-foreground">
                  Resumen de Producción
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Producido</span>
                  <span className="text-lg font-bold text-[#E5A820]">{totalProduced} uds</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Despachado</span>
                  <span className="text-lg font-bold text-foreground">{totalDispatched} uds</span>
                </div>
                <div className="border-t border-border/50 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">Balance</span>
                    <span className={`text-xl font-bold ${balance >= 0 ? "text-[#E5A820]" : "text-red-500"}`}>
                      {balance >= 0 ? `+${balance}` : balance} uds
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
                <CardTitle className="text-foreground">
                  Resumen de Consumo
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Bolsas Consumidas</span>
                  <span className="text-lg font-bold text-[#E5A820]">{totalBagsConsumed} bolsas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Kg Consumidos</span>
                  <span className="text-lg font-bold text-foreground">{totalKgConsumed} kg</span>
                </div>
                <div className="border-t border-border/50 pt-3">
                  <p className="text-xs text-muted-foreground">
                    Cada bolsa equivale a 25 kg de materia prima. El consumo se descuenta automáticamente del stock de insumos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
