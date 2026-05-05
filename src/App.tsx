import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Activos from "./pages/Activos";
import NuevoActivo from "./pages/NuevoActivo";
import ActivoDetalle from "./pages/ActivoDetalle";
import Movimientos from "./pages/Movimientos";
import Alertas from "./pages/Alertas";
import Reportes from "./pages/Reportes";
import Departamentos from "./pages/Departamentos";
import Organizaciones from "./pages/Organizaciones";
import Usuarios from "./pages/Usuarios";
import Auditoria from "./pages/Auditoria";
import Configuracion from "./pages/Configuracion";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/activos" element={<Activos />} />
              <Route path="/activos/nuevo" element={<NuevoActivo />} />
              <Route path="/activos/:id" element={<ActivoDetalle />} />
              <Route path="/movimientos" element={<Movimientos />} />
              <Route path="/alertas" element={<Alertas />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/departamentos" element={<Departamentos />} />
              <Route path="/organizaciones" element={<Organizaciones />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/auditoria" element={<Auditoria />} />
              <Route path="/configuracion" element={<Configuracion />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
