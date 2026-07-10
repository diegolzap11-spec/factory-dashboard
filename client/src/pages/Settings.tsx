import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Settings as SettingsIcon, RefreshCw, Upload, HelpCircle, Trash2, Info, Database, Bell, Palette } from "lucide-react";
import { toast } from "sonner";

const sheetsConfigSchema = z.object({
  spreadsheetId: z.string().min(1, "El ID del Spreadsheet es requerido"),
  stockSheetName: z.string().min(1, "El nombre de la hoja de Stock es requerido"),
  productionSheetName: z.string().min(1, "El nombre de la hoja de Producción es requerido"),
  shipmentsSheetName: z.string().min(1, "El nombre de la hoja de Despachos es requerido"),
  rawMaterialSheetName: z.string().min(1, "El nombre de la hoja de Insumos es requerido"),
});

type SheetsConfigValues = z.infer<typeof sheetsConfigSchema>;

export default function Settings() {
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: config } = trpc.sheets.getConfig.useQuery();
  const updateConfigMutation = trpc.sheets.updateConfig.useMutation();
  const syncAllMutation = trpc.sheets.syncAllFromSheets.useMutation();
  const exportAllMutation = trpc.sheets.exportAllToSheets.useMutation();

  const form = useForm<SheetsConfigValues>({
    resolver: zodResolver(sheetsConfigSchema),
    defaultValues: {
      spreadsheetId: config?.spreadsheetId || "",
      stockSheetName: config?.stockSheetName || "Stock",
      productionSheetName: config?.productionSheetName || "Producción",
      shipmentsSheetName: config?.shipmentsSheetName || "Despachos",
      rawMaterialSheetName: config?.rawMaterialSheetName || "Insumos",
    },
  });

  const onSubmit = async (data: SheetsConfigValues) => {
    try {
      await updateConfigMutation.mutateAsync(data);
      toast.success("Configuración actualizada correctamente");
    } catch (error) {
      toast.error("Error al actualizar la configuración");
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const result = await syncAllMutation.mutateAsync();
      if (Object.values(result).every((r) => r)) {
        toast.success("Datos sincronizados correctamente desde Google Sheets");
      } else {
        toast.warning("Google Sheets no está configurado. Configura el ID del Spreadsheet primero.");
      }
    } catch (error) {
      toast.error("Google Sheets no está disponible en esta versión");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportAll = async () => {
    setIsSyncing(true);
    try {
      const result = await exportAllMutation.mutateAsync();
      if (Object.values(result).every((r) => r)) {
        toast.success("Datos exportados correctamente a Google Sheets");
      } else {
        toast.warning("Google Sheets no está configurado");
      }
    } catch (error) {
      toast.error("Google Sheets no está disponible en esta versión");
    } finally {
      setIsSyncing(false);
    }
  };

  const formInputClass = "rounded-xl bg-input border-border/50 focus:ring-2 focus:ring-[#E5A820]/30 focus:border-[#E5A820]/50";

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h1>
          <p className="text-sm text-muted-foreground">Gestiona la integración y opciones del sistema</p>
        </div>

        {/* Database Info */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Database className="h-4 w-4 text-[#E5A820]" />
              </div>
              <div>
                <CardTitle className="text-foreground">Base de Datos</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Estado y configuración de la base de datos local
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-[#E5A820]/5 border border-[#E5A820]/15 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-sm font-medium text-foreground">Base de datos SQLite activa</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Los datos se almacenan localmente en una base de datos SQLite. 
                No se requiere conexión a internet para el funcionamiento del dashboard.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Google Sheets Configuration */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <SettingsIcon className="h-4 w-4 text-[#E5A820]" />
              </div>
              <div>
                <CardTitle className="text-foreground">Configuración de Google Sheets (Opcional)</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Configura la conexión con tu Google Sheet para sincronizar datos
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="spreadsheetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">ID del Spreadsheet</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: 1BxiMVs0XRA5nFMKUVfIvWaWqWVGF7IQkqKGauOE1234"
                          {...field}
                          className={formInputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="stockSheetName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Nombre de Hoja: Stock</FormLabel>
                        <FormControl>
                          <Input placeholder="Stock" {...field} className={formInputClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productionSheetName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Nombre de Hoja: Producción</FormLabel>
                        <FormControl>
                          <Input placeholder="Producción" {...field} className={formInputClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shipmentsSheetName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Nombre de Hoja: Despachos</FormLabel>
                        <FormControl>
                          <Input placeholder="Despachos" {...field} className={formInputClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rawMaterialSheetName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Nombre de Hoja: Insumos</FormLabel>
                        <FormControl>
                          <Input placeholder="Insumos" {...field} className={formInputClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full btn-premium bg-[#E5A820] hover:bg-[#d49a1c] text-black font-semibold rounded-xl">
                  Guardar Configuración
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Sync Actions */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-[#E5A820]" />
              </div>
              <div>
                <CardTitle className="text-foreground">Sincronización de Datos</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Sincroniza datos entre el dashboard y Google Sheets
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                  variant="outline"
                  className="gap-2 rounded-xl border-border/50 hover:bg-secondary/50 hover:border-[#E5A820]/30 text-foreground h-11"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Sincronizando..." : "Sincronizar desde Google Sheets"}
                </Button>

                <Button
                  onClick={handleExportAll}
                  disabled={isSyncing}
                  variant="outline"
                  className="gap-2 rounded-xl border-border/50 hover:bg-secondary/50 hover:border-[#E5A820]/30 text-foreground h-11"
                >
                  <Upload className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Exportando..." : "Exportar a Google Sheets"}
                </Button>
              </div>

              <div className="rounded-xl bg-[#E5A820]/5 border border-[#E5A820]/15 p-4 text-sm text-foreground">
                <p className="font-medium text-[#E5A820] mb-1">Nota:</p>
                <p className="text-muted-foreground">
                  La integración con Google Sheets requiere configuración adicional. 
                  Consulta GOOGLE_SHEETS_SETUP.md para instrucciones detalladas.
                  Sin configuración, las operaciones de sincronización no tendrán efecto.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#E5A820]/10 flex items-center justify-center">
                <Info className="h-4 w-4 text-[#E5A820]" />
              </div>
              <div>
                <CardTitle className="text-foreground">Información del Sistema</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Detalles técnicos del dashboard
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/20">
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versión</span>
                  <span className="text-foreground font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base de Datos</span>
                  <span className="text-foreground font-medium">SQLite (local)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API</span>
                  <span className="text-foreground font-medium">tRPC + Express</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frontend</span>
                  <span className="text-foreground font-medium">React + Vite + TailwindCSS</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
