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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const consumptionFormSchema = z.object({
  categoryId: z.number(),
  bagsConsumed: z.number().min(1, "Debe consumir al menos 1 bolsa"),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

type ConsumptionFormValues = z.infer<typeof consumptionFormSchema>;

export default function ConsumptionLog() {
  const [open, setOpen] = useState(false);

  const { data: categories } = trpc.rawMaterials.getCategories.useQuery();
  const { data: allConsumption, refetch: refetchConsumption } =
    trpc.consumption.getAll.useQuery();
  const createConsumptionMutation = trpc.consumption.create.useMutation();

  const form = useForm<ConsumptionFormValues>({
    resolver: zodResolver(consumptionFormSchema),
    defaultValues: {
      categoryId: 0,
      bagsConsumed: 1,
      date: new Date(),
      notes: "",
    },
  });

  const onSubmit = async (data: ConsumptionFormValues) => {
    try {
      await createConsumptionMutation.mutateAsync({
        categoryId: data.categoryId,
        bagsConsumed: data.bagsConsumed,
        date: data.date,
        notes: data.notes,
      });
      toast.success("Consumo registrado correctamente (stock actualizado)");
      form.reset({ date: new Date() });
      setOpen(false);
      refetchConsumption();
    } catch (error) {
      toast.error("Error al registrar el consumo");
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categories?.find((c) => c.id === categoryId)?.name || "Desconocido";
  };

  const totalBagsConsumed =
    allConsumption?.reduce((sum, c) => sum + c.bagsConsumed, 0) || 0;
  const totalKgConsumed = totalBagsConsumed * 25;

  const todayConsumption =
    allConsumption?.filter((c) => {
      const consumptionDate = new Date(c.date);
      const today = new Date();
      return (
        consumptionDate.getDate() === today.getDate() &&
        consumptionDate.getMonth() === today.getMonth() &&
        consumptionDate.getFullYear() === today.getFullYear()
      );
    }) || [];

  const todayBags = todayConsumption.reduce((sum, c) => sum + c.bagsConsumed, 0);
  const todayKg = todayBags * 25;

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
              Consumo de Insumos
            </h1>
            <p className="text-sm text-muted-foreground">
              Registra el consumo de materia prima en bolsas. Cada bolsa equivale a 25 kg. Se descuenta automáticamente del stock.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 btn-premium bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl">
                <Plus className="h-4 w-4" />
                Registrar Consumo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Registrar Consumo de Insumos
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Ingresa la cantidad de bolsas de 25 kg consumidas
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Tipo de Materia Prima
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
                            <option value="">Selecciona una categoría</option>
                            {categories?.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
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
                    name="bagsConsumed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Cantidad de Bolsas (25 kg c/u)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
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
                            placeholder="Ej: Consumo en línea de producción A"
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
                Consumo Total
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
                {totalKgConsumed} kg consumidos en total
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Consumo Hoy
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">
                {todayBags}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {todayKg} kg consumidos hoy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Consumption History Table */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
              <CardTitle className="text-foreground">
                Historial de Consumo
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Registro de consumo de insumos en bolsas
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
                      Categoría
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Bolsas Consumidas
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Kg Consumidos
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Notas
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allConsumption && allConsumption.length > 0 ? (
                    allConsumption.map((consumption) => (
                      <TableRow
                        key={consumption.id}
                        className="border-border/20 hover:bg-secondary/20 transition-colors"
                      >
                        <TableCell className="text-foreground">
                          {new Date(consumption.date).toLocaleDateString(
                            "es-ES"
                          )}
                        </TableCell>
                        <TableCell className="text-foreground capitalize">
                          {getCategoryName(consumption.categoryId)}
                        </TableCell>
                        <TableCell className="font-bold text-[#E5A820]">
                          {consumption.bagsConsumed}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {consumption.bagsConsumed * 25}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {consumption.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No hay registros de consumo
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
