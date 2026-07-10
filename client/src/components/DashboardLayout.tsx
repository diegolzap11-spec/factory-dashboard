import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { APP_NAME, APP_DESCRIPTION } from "../const";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, Factory, Truck, Droplets, Trash2, BarChart3,
  Settings, Menu, X, ChevronLeft, ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/stock", label: "Stock", icon: Package },
  { path: "/production", label: "Producción", icon: Factory },
  { path: "/shipments", label: "Despachos", icon: Truck },
  { path: "/raw-materials", label: "Insumos", icon: Droplets },
  { path: "/consumption", label: "Consumo", icon: Trash2 },
  { path: "/reports", label: "Reportes", icon: BarChart3 },
  { path: "/settings", label: "Configuración", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-border/40 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn("p-4 border-b border-border/40 flex items-center gap-3", collapsed ? "justify-center" : "")}>
          <div className="w-10 h-10 rounded-lg bg-[#E5A820] flex items-center justify-center shrink-0">
            <span className="text-black font-bold text-lg">FI</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="font-bold text-sidebar-foreground text-sm leading-tight">{APP_NAME}</h2>
              <p className="text-[10px] text-muted-foreground leading-tight">{APP_DESCRIPTION}</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-[#E5A820]/15 text-[#E5A820] sidebar-active"
                    : "text-sidebar-foreground/70 hover:bg-secondary/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-[#E5A820]" : "")} />
                {!collapsed && (
                  <span className={cn("text-sm font-medium", isActive ? "text-[#E5A820]" : "")}>{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button */}
        <div className="p-3 border-t border-border/40">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span className="text-xs">Colapsar</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-sm flex items-center px-4 lg:px-6 gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary/50 text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-medium text-muted-foreground">
              {NAV_ITEMS.find((n) => n.path === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E5A820]/20 flex items-center justify-center">
              <span className="text-xs font-bold text-[#E5A820]">AD</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
