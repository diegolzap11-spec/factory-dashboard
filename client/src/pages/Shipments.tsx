import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import { HELMET_COLORS, HELMET_PRODUCTS } from "../const";
import { Slider } from "@/components/ui/slider";

const shipmentsFormSchema = z.object({
  productTypeId: z.number().min(1, "Debe seleccionar un producto"),
  color: z.string().optional(),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
  date: z.date(),
  notes: z.string().optional(),
});

type ShipmentsFormValues = z.infer<typeof shipmentsFormSchema>;

export default function Shipments() {
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const { data: products } = trpc.products.list.useQuery();
  const { data: allShipments, refetch: refetchShipments } = trpc.shipments.getAll.useQuery();
  const { data: allStock, refetch: refetchStock } = trpc.stock.getAll.useQuery();
  const createShipmentMutation = trpc.shipments.create.useMutation();

  const form = useForm<ShipmentsFormValues>({
    resolver: zodResolver(shipmentsFormSchema),
    defaultValues: {
      productTypeId: 0,
      color: "",
      quantity: 0,
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
      toast.success("Despacho registrado correctamente. Stock actualizado.");
      form.reset({ date: new Date() });
      setOpen(false);
      setSelectedProductId(null);
      refetchShipments();
      refetchStock();
    } catch (error: any) {
      toast.error(error?.message || "Error al registrar el despacho");
    }
  };

  const getProductName = (productTypeId: number) => {
    return products?.find((p) => p.id === productTypeId)?.name || "Desconocido";
  };

  const isHelmetProduct = (productName: string) => {
    return HELMET_PRODUCTS.includes(productName as any);
  };

  const getAvailableStock = (productTypeId: number, color?: string) => {
    if (!allStock) return 0;
    const stockItems = allStock.filter((s) => s.productTypeId === productTypeId);
    if (color) {
      const item = stockItems.find((s) => s.color === color);
      return item?.quantity || 0;
    }
    return stockItems.reduce((sum, s) => sum + s.quantity, 0);
  };

  const handleOpenDialog = () => {
    setSelectedProductId(null);
    form.reset({
      productTypeId: 0,
      color: "",
      quantity: 0,
      date: new Date(),
      notes: "",
    });
    setOpen(true);
  };

  const sortedShipments = [...(allShipments || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalShipments = allShipments?.reduce((sum, s) => sum + s.quantity, 0) || 0;
  const todayShipments = allShipments?.filter(
    (s) => new Date(s.date).toDateString() === new Date().toDateString()
  ) || [];
  const todayTotal = todayShipments.reduce((sum, s) => sum + s.quantity, 0);

  const formSelectClass = "w-full px-3 py-2 border border-border/50 rounded-xl bg-input text-foreground focus:ring-2 focus:ring-[#E5A820]/30 focus:border-[#E5A820]/50 outline-none transition-all";
  const formInputClass = "rounded-xl bg-input border-border/50 focus:ring-2 focus:ring-[#E5A820]/30 focus:border-[#E5A820]/50";

  const selectedColor = form.watch("color");
  const selectedProductIdForm = form.watch("productTypeId");
  const availableStock = getAvailableStock(selectedProductIdForm, selectedColor);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Registro de Despachos</h1>
            <p className="text-sm text-muted-foreground">Registra y visualiza los despachos diarios</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog} className="gap-2 btn-premium bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl">
                <Plus className="h-4 w-4" />
                Registrar Despacho
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-foreground">Registrar Despacho</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Ingresa los detalles del despacho
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="productTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Tipo de Producto</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            value={field.value}
                            onChange={(e) => {
                              const productId = Number(e.target.value);
                              field.onChange(productId);
                              setSelectedProductId(productId);
                              // Reset color when product changes
                              form.setValue("color", "");
                            }}
                            className={formSelectClass}
                          >
                            <option value="">Selecciona un producto</option>
                            {products?.map((p) => (
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

                  {selectedProductId && isHelmetProduct(getProductName(selectedProductId)) && (
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Color (1-9)</FormLabel>
                          <FormControl>
                            <div className="space-y-4 py-2">
                              <Slider
                                min={1}
                                max={9}
                                step={1}
                                value={[Number(HELMET_COLORS.find(c => c.name === field.value)?.id || 1)]}
                                onValueChange={(vals) => {
                                  const color = HELMET_COLORS.find(c => c.id === vals[0].toString());
                                  if (color) field.onChange(color.name);
                                }}
                                className="py-4"
                              />
                              <div className="flex justify-between px-1">
                                {HELMET_COLORS.map((color) => {
                                  const colorStock = getAvailableStock(selectedProductId, color.name);
                                  return (
                                    <div
                                      key={color.id}
                                      className={`flex flex-col items-center gap-1 transition-all ${
                                        field.value === color.name ? "scale-110" : "opacity-50"
                                      } ${colorStock === 0 ? "grayscale" : ""}`}
                                    >
                                      <div
                                        className="w-4 h-4 rounded-full border border-border/50 shadow-sm"
                                        style={{ backgroundColor: color.hex }}
                                      />
                                      <span className="text-[10px] font-bold text-foreground">{color.id}</span>
                                      <span className="text-[10px] text-muted-foreground">{colorStock}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              {field.value && (
                                <div className="text-sm text-center font-medium text-[#E5A820]">
                                  Seleccionado: {field.value} | Stock: {availableStock}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedProductId && !isHelmetProduct(getProductName(selectedProductId)) && (
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Color (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Amarillo, Blanco, Azul" {...field} className={formInputClass} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {!selectedProductId && (
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Color</FormLabel>
                          <FormControl>
                            <Input placeholder="Selecciona primero un producto" disabled {...field} className={formInputClass} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Cantidad Despachada</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className={formInputClass}
                            />
                            {selectedColor && availableStock > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Stock disponible: <span className="font-semibold text-[#E5A820]">{availableStock}</span>
                              </p>
                            )}
                            {availableStock === 0 && selectedColor && (
                              <p className="text-xs text-red-400">
                                No hay stock disponible para este color
                              </p>
                            )}
                          </div>
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
                            value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
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
                        <FormLabel className="text-foreground">Notas (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Destino, transportista" {...field} className={formInputClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full btn-premium bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Despachos Totales</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Truck className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">{totalShipments}</div>
              <p className="text-xs text-muted-foreground mt-1">Unidades despachadas en total</p>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Despachos Hoy</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Truck className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">{todayTotal}</div>
              <p className="text-xs text-muted-foreground mt-1">Unidades despachadas hoy</p>
            </CardContent>
          </Card>
        </div>

        {/* Shipments History Table */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
              <CardTitle className="text-foreground">Historial de Despachos</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Últimos registros de despachos</p>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 bg-secondary/30">
                    <TableHead className="text-muted-foreground font-medium">Fecha</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Tipo de Producto</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Color</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Cantidad</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedShipments.length > 0 ? (
                    sortedShipments.map((shipment) => (
                      <TableRow key={shipment.id} className="border-border/20 hover:bg-secondary/20 transition-colors">
                        <TableCell className="text-foreground">
                          {new Date(shipment.date).toLocaleDateString("es-ES")}
                        </TableCell>
                        <TableCell className="text-foreground">{getProductName(shipment.productTypeId)}</TableCell>
                        <TableCell className="text-foreground">{shipment.color || "-"}</TableCell>
                        <TableCell className="font-bold text-[#E5A820]">{shipment.quantity}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {shipment.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
