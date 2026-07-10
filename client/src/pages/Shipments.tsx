import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import { HELMET_COLORS, HELMET_PRODUCTS } from "../const";

const shipmentsFormSchema = z.object({
  productTypeId: z.number(),
  color: z.string().min(1, "El color es requerido"),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

type ShipmentsFormValues = z.infer<typeof shipmentsFormSchema>;

export default function Shipments() {
  const [open, setOpen] = useState(false);

  const { data: products } = trpc.products.list.useQuery();
  const { data: allShipments, refetch: refetchShipments } =
    trpc.shipments.getAll.useQuery();
  const createShipmentMutation = trpc.shipments.create.useMutation();

  // Filtrar solo productos de casco
  const helmetProducts = products?.filter((p) =>
    HELMET_PRODUCTS.includes(p.name as (typeof HELMET_PRODUCTS)[number])
  );

  const form = useForm<ShipmentsFormValues>({
    resolver: zodResolver(shipmentsFormSchema),
    defaultValues: {
      productTypeId: 0,
      color: "",
      quantity: 1,
      date: new Date(),
      notes: "",
    },
  });

  const onSubmit = async (data: ShipmentsFormValues) => {
    try {
      await createShipmentMutation.mutateAsync({
        productTypeId: data.productTypeId,
        color: data.color,
        quantity: data.quantity,
        date: data.date,
        notes: data.notes,
      });
      toast.success("Despacho registrado correctamente (stock descontado)");
      form.reset({ date: new Date() });
      setOpen(false);
      refetchShipments();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al registrar el despacho"
      );
    }
  };

  const getProductName = (productTypeId: number) => {
    return products?.find((p) => p.id === productTypeId)?.name || "Desconocido";
  };

  const sortedShipments = [...(allShipments || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalShipments =
    allShipments?.reduce((sum, s) => sum + s.quantity, 0) || 0;
  const todayShipments = allShipments?.filter(
    (s) => new Date(s.date).toDateString() === new Date().toDateString()
  ) || [];
  const todayTotal = todayShipments.reduce((sum, s) => sum + s.quantity, 0);

  const formSelectClass =
    "w-full px-3 py-2 border border-border/50 rounded-xl bg-input text-foreground focus:ring-2 focus:ring-[#E5A820]/30 focus:border-[#E5A820]/50 outline-none transition-all";
  const formInputClass =
    "rounded-xl bg-input border-border/50 focus:ring-2 focus:ring-[#E5A820]/30 focus:border-[#E5A820]/50";

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Registro de Despachos
            </h1>
            <p className="text-sm text-muted-foreground">
              Registra y visualiza los despachos diarios (se descuenta automáticamente del stock)
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 btn-premium bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl">
                <Plus className="h-4 w-4" />
                Registrar Despacho
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Registrar Despacho
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Ingresa los detalles del despacho. Se verificará que haya stock disponible.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="productTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Tipo de Casco
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className={formSelectClass}
                          >
                            <option value="">Selecciona un casco</option>
                            {helmetProducts?.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Color</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className={formSelectClass}
                          >
                            <option value="">Selecciona un color</option>
                            {HELMET_COLORS.map((color) => (
                              <option key={color} value={color}>
                                {color.charAt(0).toUpperCase() + color.slice(1)}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Cantidad Despachada
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className={formInputClass}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Fecha</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={
                              field.value instanceof Date
                                ? field.value.toISOString().split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                            className={formInputClass}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Notas (Opcional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Destino, transportista"
                            {...field}
                            className={formInputClass}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full btn-premium bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl"
                  >
                    Registrar
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 stagger-children">
          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Despachos Totales
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Truck className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">
                {totalShipments}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unidades despachadas en total
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Despachos Hoy
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Truck className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">
                {todayTotal}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unidades despachadas hoy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Shipments History Table */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
              <CardTitle className="text-foreground">
                Historial de Despachos
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Últimos registros de despachos
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 bg-secondary/30">
                    <TableHead className="text-muted-foreground font-medium">
                      Fecha
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Casco
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Color
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Cantidad
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Notas
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedShipments.length > 0 ? (
                    sortedShipments.map((shipment) => (
                      <TableRow
                        key={shipment.id}
                        className="border-border/20 hover:bg-secondary/20 transition-colors"
                      >
                        <TableCell className="text-foreground">
                          {new Date(shipment.date).toLocaleDateString("es-ES")}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {getProductName(shipment.productTypeId)}
                        </TableCell>
                        <TableCell className="text-foreground capitalize">
                          {shipment.color || "-"}
                        </TableCell>
                        <TableCell className="font-bold text-[#E5A820]">
                          {shipment.quantity}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {shipment.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No hay registros de despachos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
