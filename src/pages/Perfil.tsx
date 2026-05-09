import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User as UserIcon, Mail, Shield, Calendar } from "lucide-react";

export default function Perfil() {
  const { user, roles } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [creadoEn, setCreadoEn] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nombre,email,creado_en")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setNombre(data.nombre ?? "");
        setEmail(data.email ?? user.email ?? "");
        setCreadoEn(data.creado_en);
      } else {
        setEmail(user.email ?? "");
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ nombre })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Error al guardar: " + error.message);
    else toast.success("Perfil actualizado");
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) toast.error(error.message);
    else toast.success("Te enviamos un correo para restablecer tu contraseña");
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">Gestiona tu información personal y seguridad</p>
      </div>

      <div className="bg-card border rounded-lg p-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
          {(nombre || email)?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold">{nombre || "Sin nombre"}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> {email}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {roles.length > 0 ? roles.map((r) => (
              <Badge key={r} variant="secondary" className="capitalize">
                <Shield className="h-3 w-3 mr-1" /> {r}
              </Badge>
            )) : <Badge variant="outline">Sin rol asignado</Badge>}
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><UserIcon className="h-4 w-4" /> Información personal</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" value={email} disabled />
          </div>
        </div>
        {creadoEn && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Cuenta creada el {new Date(creadoEn).toLocaleDateString()}
          </div>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-3">
        <h3 className="font-semibold flex items-center gap-2"><Shield className="h-4 w-4" /> Seguridad</h3>
        <p className="text-sm text-muted-foreground">Recibirás un enlace en tu correo para cambiar tu contraseña.</p>
        <Button variant="outline" onClick={handlePasswordReset}>Cambiar contraseña</Button>
      </div>
    </div>
  );
}
