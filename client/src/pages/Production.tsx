import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Factory, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const productionFormSchema = z.object({
  productTypeId: z.number(),
  color: z.string().optional(),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

type ProductionFormValues = z.infer<typeof productionFormSchema>;

export default function Production() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: products } = trpc.products.list.useQuery();
  const { data: allProduction, refetch: refetchProduction } = trpc.production.getAll.useQuery();
  const createProductionMutation = trpc.production.create.useMutation();
  const updateProductionMutation = trpc.production.update.useMutation();
  const deleteProductionMutation = trpc.production.delete.useMutation();

  const form = useForm<ProductionFormValues>({
    resolver: zodResolver(productionFormSchema),
    defaultValues: {
      productTypeId: 0,
      color: "",
      quantity: 0,
      date: new Date(),
      notes: "",
    },
  });

  const editForm = useForm<ProductionFormValues>({
    resolver: zodResolver(productionFormSchema),
    defaultValues: {
      productTypeId: 0,
      color: "",
      quantity: 0,
      date: new Date(),
      notes: "",
    },
  });

  const onSubmit = async (data: ProductionFormValues) => {
    try {
      await createProductionMutation.mutateAsync({
        productTypeId: data.productTypeId,
        color: data.color,
        quantity: data.quantity,
        date: data.date,
        notes: data.notes,
      });
      toast.success("Producción registrada correctamente");
      form.reset({ productTypeId: 0, color: "", quantity: 0, date: new Date(), notes: "" });
      setOpen(false);
      refetchProduction();
    } catch (error) {
      toast.error("Error al registrar la producción");
    }
  };

  const onEdit = async (data: ProductionFormValues) => {
    if (!selectedId) return;
    try {
      await updateProductionMutation.mutateAsync({
        id: selectedId,
        productTypeId: data.productTypeId,
        color: data.color,
        quantity: data.quantity,
        date: data.date,
        notes: data.notes,
      });
      toast.success("Producción actualizada correctamente. Stock recalculado.");
      setEditOpen(false);
      setSelectedId(null);
      refetchProduction();
    } catch (error) {
      toast.error("Error al actualizar la producción");
    }
  };

  const onDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteProductionMutation.mutateAsync({ id: selectedId });
      toast.success("Producción eliminada. Stock actualizado automáticamente.");
      setDeleteOpen(false);
      setSelectedId(null);
      refetchProduction();
    } catch (error) {
      toast.error("Error al eliminar la producción");
    }
  };

  const handleEditClick = (record: any) => {
    setSelectedId(record.id);
    editForm.reset({
      productTypeId: record.productTypeId,
      color: record.color || "",
      quantity: record.quantity,
      date: new Date(record.date),
      notes: record.notes || "",
    });
    setEditOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setDeleteOpen(true);
  };

  const getProductName = (productTypeId: number) => {
    return products?.find((p) => p.id === productTypeId)?.name || "Desconocido";
  };

  const sortedProduction = [...(allProduction || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalProduction = allProduction?.reduce((sum, p) => sum + p.quantity, 0) || 0;

  const formSelectClass = "w-full px-3 py-2 border border-border/50 rounded-xl bg-input text-foreground focus:ring-2 focus:ring-[#E5A820]/30 focus:border-[#E5A820]/50 outline-none transition-all";
  const formInputClass = "rounded-xl bg-input border-border/50 focus:ring-2 focus:ring-[#E5A820]/30 focus:border-[#E5A820]/50";

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Registro de Producción</h1>
            <p className="text-sm text-muted-foreground">Registra la cantidad producida diariamente</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 btn-premium bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl">
                <Plus className="h-4 w-4" />
                Registrar Producción
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle className="text-foreground">Registrar Producción</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Ingresa los detalles de la producción del día
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
                            onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Color</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Amarillo, Blanco, Azul" {...field} className={formInputClass} />
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
                        <FormLabel className="text-foreground">Cantidad Producida</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
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
                          <Input placeholder="Ej: Turno matutino, sin incidentes" {...field} className={formInputClass} />
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

        {/* Summary Card */}
        <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Producción Total</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
              <Factory className="h-4 w-4 text-[#E5A820]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#E5A820]">{totalProduction}</div>
            <p className="text-xs text-muted-foreground mt-1">Unidades producidas en total</p>
          </CardContent>
        </Card>

        {/* Production History Table */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
              <CardTitle className="text-foreground">Historial de Producción</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Últimos registros de producción</p>
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
                    <TableHead className="text-right text-muted-foreground font-medium">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProduction.length > 0 ? (
                    sortedProduction.map((record) => (
                      <TableRow key={record.id} className="border-border/20 hover:bg-secondary/20 transition-colors">
                        <TableCell className="text-foreground">
                          {new Date(record.date).toLocaleDateString("es-ES")}
                        </TableCell>
                        <TableCell className="text-foreground">{getProductName(record.productTypeId)}</TableCell>
                        <TableCell className="text-foreground">{record.color || "-"}</TableCell>
                        <TableCell className="font-bold text-[#E5A820]">{record.quantity}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(record)}
                              className="gap-1 rounded-lg border-border/50 hover:bg-secondary/50 hover:border-[#E5A820]/30 text-foreground"
                            >
                              <Pencil className="h-3 w-3" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(record.id)}
                              className="gap-1 rounded-lg border-border/50 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30"
                            >
                              <Trash2 className="h-3 w-3" />
                              Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No hay registros de producción
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle className="text-foreground">Editar Producción</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Modifica los datos del registro. El stock se recalculará automáticamente.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="productTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Tipo de Producto</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                <FormField
                  control={editForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Amarillo, Blanco, Azul" {...field} className={formInputClass} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Cantidad Producida</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className={formInputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Notas (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Turno matutino, sin incidentes" {...field} className={formInputClass} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full btn-premium bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl">
                  Guardar Cambios
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent className="bg-card border-border/50">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Eliminar Registro de Producción</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Esta acción eliminará el registro y descontará automáticamente la cantidad del stock correspondiente. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl border-border/50">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700 rounded-xl">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
