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
import { Plus, Droplet } from "lucide-react";
import { toast } from "sonner";

const rawMaterialFormSchema = z.object({
  categoryId: z.number(),
  name: z.string().min(1, "El nombre es requerido"),
  quantity: z.number().min(0, "La cantidad de bolsas debe ser mayor o igual a 0"),
});

type RawMaterialFormValues = z.infer<typeof rawMaterialFormSchema>;

export default function RawMaterials() {
  const [open, setOpen] = useState(false);

  const { data: categories } = trpc.rawMaterials.getCategories.useQuery();
  const { data: allMaterials, refetch: refetchMaterials } =
    trpc.rawMaterials.getAll.useQuery();
  const createMaterialMutation = trpc.rawMaterials.create.useMutation();

  const form = useForm<RawMaterialFormValues>({
    resolver: zodResolver(rawMaterialFormSchema),
    defaultValues: {
      categoryId: 0,
      name: "",
      quantity: 0,
    },
  });

  const onSubmit = async (data: RawMaterialFormValues) => {
    try {
      await createMaterialMutation.mutateAsync({
        categoryId: data.categoryId,
        name: data.name,
        quantity: data.quantity.toString(),
        unit: "bolsas",
      });
      toast.success("Insumo registrado correctamente");
      form.reset();
      setOpen(false);
      refetchMaterials();
    } catch (error) {
      toast.error("Error al registrar el insumo");
    }
  };

  const groupedMaterials =
    categories?.map((category) => ({
      category,
      materials:
        allMaterials?.filter((m) => m.categoryId === category.id) || [],
    })) || [];

  // Calcular totales por bolsa
  const highQualityTotal =
    groupedMaterials
      .find((g) => g.category.name.includes("alta"))
      ?.materials.reduce(
        (sum, m) => sum + parseFloat(m.quantity.toString()),
        0
      ) || 0;

  const lowQualityTotal =
    groupedMaterials
      .find((g) => g.category.name.includes("baja"))
      ?.materials.reduce(
        (sum, m) => sum + parseFloat(m.quantity.toString()),
        0
      ) || 0;

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
              Gestión de Insumos
            </h1>
            <p className="text-sm text-muted-foreground">
              Control de materia prima registrada en bolsas (Alta y Baja)
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 btn-premium bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl">
                <Plus className="h-4 w-4" />
                Agregar Insumo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Agregar Insumo (Bolsas)
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Registra el stock de insumos en bolsas. Cada bolsa equivale a 25 kg.
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
                          Categoría
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Nombre del Insumo
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Plástico ABS, Espuma de poliuretano"
                            {...field}
                            className={formInputClass}
                          />
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
                          Cantidad de Bolsas
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
                  <Button
                    type="submit"
                    className="w-full btn-premium bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl"
                  >
                    Agregar
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
                Bolsas de Alta
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Droplet className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">
                {Math.floor(highQualityTotal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                bolsas en stock ({(highQualityTotal * 25).toFixed(0)} kg)
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bolsas de Baja
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Droplet className="h-4 w-4 text-[#E5A820]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#E5A820]">
                {Math.floor(lowQualityTotal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                bolsas en stock ({(lowQualityTotal * 25).toFixed(0)} kg)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Materials by Category */}
        {groupedMaterials.map(({ category, materials }) => (
          <Card
            key={category.id}
            className="border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden"
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[#E5A820]" />
                <CardTitle className="capitalize text-foreground">
                  {category.name}
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/30 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 bg-secondary/30">
                      <TableHead className="text-muted-foreground font-medium">
                        Nombre del Insumo
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Bolsas
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Kg Equivalentes
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Última Actualización
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.length > 0 ? (
                      materials.map((material) => (
                        <TableRow
                          key={material.id}
                          className="border-border/20 hover:bg-secondary/20 transition-colors"
                        >
                          <TableCell className="font-medium text-foreground">
                            {material.name}
                          </TableCell>
                          <TableCell className="font-bold text-[#E5A820]">
                            {material.quantity}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {parseFloat(material.quantity.toString()) * 25}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(
                              material.lastUpdated
                            ).toLocaleDateString("es-ES")}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground py-8"
                        >
                          No hay insumos registrados en esta categoría
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
