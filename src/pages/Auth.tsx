import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Server, Loader2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bienvenido");
    navigate("/");
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signUp({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nombre: String(fd.get("nombre")) },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Cuenta creada. Ya puedes iniciar sesión.");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--gradient-primary)" }}>
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 text-primary-foreground">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">InventarioTI</div>
            <div className="text-sm opacity-80">Asset Management para PyMES</div>
          </div>
        </div>
        <h1 className="text-4xl font-bold leading-tight mb-4 max-w-lg">
          Gestión profesional de activos IT, lista para auditoría.
        </h1>
        <p className="text-base opacity-85 max-w-md">
          Centraliza tu inventario, rastrea el ciclo de vida completo de cada equipo
          y genera reportes auditables en un solo lugar.
        </p>
        <ul className="mt-8 space-y-2 text-sm opacity-90">
          <li>✓ Historial inmutable de movimientos</li>
          <li>✓ Alertas de garantías y mantenimiento</li>
          <li>✓ Reportes PDF / Excel listos para auditoría</li>
          <li>✓ Roles, permisos y trazabilidad completa</li>
        </ul>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card rounded-xl shadow-2xl p-8">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <Server className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">InventarioTI</span>
          </div>
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" name="password" type="password" required autoComplete="current-password" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ingresar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input id="nombre" name="nombre" required />
                </div>
                <div>
                  <Label htmlFor="email-s">Email</Label>
                  <Input id="email-s" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="password-s">Contraseña</Label>
                  <Input id="password-s" name="password" type="password" required minLength={8} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear cuenta
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  El primer usuario registrado se convierte en administrador.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
