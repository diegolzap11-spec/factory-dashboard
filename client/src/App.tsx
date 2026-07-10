import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Stock from "./pages/Stock";
import Production from "./pages/Production";
import Shipments from "./pages/Shipments";
import RawMaterials from "./pages/RawMaterials";
import ConsumptionLog from "./pages/ConsumptionLog";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import { Toaster } from "sonner";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/production" element={<Production />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/raw-materials" element={<RawMaterials />} />
        <Route path="/consumption" element={<ConsumptionLog />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-card)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-border)",
          },
        }}
      />
    </BrowserRouter>
  );
}
