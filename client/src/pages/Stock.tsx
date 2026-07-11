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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Package } from "lucide-react";
import { toast } from "sonner";
import {
  HELMET_COLORS,
  COLOR_HEX_MAP,
  HELMET_PRODUCTS,
  getProductImage,
} from "../const";
import { Slider } from "@/components/ui/slider";

const stockFormSchema = z.object({
  productTypeId: z.number(),
  color: z.string().min(1, "El color es requerido"),
  quantity: z.number().min(0, "La cantidad debe ser mayor a 0"),
});

type StockFormValues = z.infer<typeof stockFormSchema>;

export default function Stock() {
  const [open, setOpen] = useState(false);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);

  const { data: products } = trpc.products.list.useQuery();
  const { data: allStock, refetch: refetchStock } = trpc.stock.getAll.useQuery();
  const createStockMutation = trpc.stock.create.useMutation();
  const updateStockMutation = trpc.stock.update.useMutation();

  const form = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: {
      productTypeId: 0,
      color: "",
      quantity: 0,
    },
  });

  const selectedProductId = form.watch("productTypeId");
  const selectedProduct = products?.find(p => p.id === selectedProductId);
  const isHelmet = selectedProduct && HELMET_PRODUCTS.includes(selectedProduct.name as any);

  const onSubmit = async (data: StockFormValues) => {
    try {
      if (editingStockId) {
        await updateStockMutation.mutateAsync({
          stockId: editingStockId,
          quantity: data.quantity,
        });
        toast.success("Stock actualizado correctamente");
      } else {
        await createStockMutation.mutateAsync({
          productTypeId: data.productTypeId,
          color: data.color || "Estándar",
          quantity: data.quantity,
        });
        toast.success("Stock registrado correctamente");
      }
      form.reset();
      setOpen(false);
      setEditingStockId(null);
      refetchStock();
    } catch (error) {
      toast.error("Error al guardar el stock");
    }
  };

  // Agrupar stock por producto
  const groupedStock = products?.map((product) => ({
    product,
    stock: allStock?.filter((s) => s.productTypeId === product.id) || [],
  })) || [];

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
              Gestión de Stock
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualiza y actualiza el inventario de cascos por color
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 btn-premium bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl">
                <Plus className="h-4 w-4" />
                Agregar Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {editingStockId ? "Editar Stock" : "Agregar Stock"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Ingresa los detalles del stock para el casco
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
	                  {isHelmet ? (
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
                                {HELMET_COLORS.map((color) => (
                                  <div
                                    key={color.id}
                                    className={`flex flex-col items-center gap-1 transition-all ${
                                      field.value === color.name ? "scale-110" : "opacity-50"
                                    }`}
                                  >
                                    <div
                                      className="w-4 h-4 rounded-full border border-border/50 shadow-sm"
                                      style={{ backgroundColor: color.hex }}
                                    />
                                    <span className="text-[10px] font-bold text-foreground">{color.id}</span>
                                  </div>
                                ))}
                              </div>
                              {field.value && (
                                <div className="text-sm text-center font-medium text-[#E5A820]">
                                  Seleccionado: {field.value}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Color / Etiqueta</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Estándar, Azul, etc." {...field} className={formInputClass} />
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
                        <FormLabel className="text-foreground">
                          Cantidad
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
                    {editingStockId ? "Actualizar" : "Agregar"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Casco Cards con colores en orden */}
        <div className="grid gap-6 md:grid-cols-2 stagger-children">
          {groupedStock.map(({ product, stock }) => (
            <Card
              key={product.id}
              className="card-premium gold-line-bottom overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm rounded-2xl"
            >
              <div className="aspect-[4/3] overflow-hidden bg-secondary/30 flex items-center justify-center p-4">
                <img
                  src={getProductImage(product.name)}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-foreground">
                  {product.name}
                </CardTitle>
	                <p className="text-sm text-muted-foreground">
	                  Total en stock:{" "}
	                  <span className="font-bold text-[#E5A820]">
	                    {stock.reduce((sum, s) => sum + s.quantity, 0)}
	                  </span>
	                </p>
	              </CardHeader>
	              <CardContent className="space-y-2 pb-5">
	                {HELMET_PRODUCTS.includes(product.name as any) ? (
	                  <div className="grid gap-2 sm:grid-cols-3">
	                    {HELMET_COLORS.map((color) => {
	                      const item = stock.find(
	                        (s) => s.color.toLowerCase() === color.name.toLowerCase()
	                      );
	                      return (
	                        <div
	                          key={color.id}
	                          className="flex items-center justify-between p-2.5 bg-secondary/40 rounded-xl border border-border/30"
	                        >
	                          <div className="flex items-center gap-2.5">
	                            <div
	                              className="w-4 h-4 rounded-full border border-border/50 shadow-sm"
	                              style={{
	                                backgroundColor: color.hex,
	                              }}
	                            />
	                            <span className="text-sm font-medium text-foreground">
	                              {color.id}. {color.name}
	                            </span>
	                          </div>
	                          <span className="text-sm font-bold text-[#E5A820]">
	                            {item?.quantity || 0}
	                          </span>
	                        </div>
	                      );
	                    })}
	                  </div>
	                ) : (
	                  <div className="grid gap-2">
	                    {stock.length > 0 ? (
	                      stock.map((item) => (
	                        <div
	                          key={item.id}
	                          className="flex items-center justify-between p-2.5 bg-secondary/40 rounded-xl border border-border/30"
	                        >
	                          <span className="text-sm font-medium text-foreground">
	                            {item.color}
	                          </span>
	                          <span className="text-sm font-bold text-[#E5A820]">
	                            {item.quantity}
	                          </span>
	                        </div>
	                      ))
	                    ) : (
	                      <div className="text-center py-4 text-muted-foreground text-sm">
	                        Sin stock registrado
	                      </div>
	                    )}
	                  </div>
	                )}
	              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
