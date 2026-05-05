import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

type Role = "administrador" | "coordinador" | "usuario";

export default function Usuarios() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data: profs } = await supabase.from("profiles").select("*").order("creado_en", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("user_id,role");
    const map: Record<string, string[]> = {};
    (roles ?? []).forEach((r: any) => { (map[r.user_id] ||= []).push(r.role); });
    setUsers((profs ?? []).map((p: any) => ({ ...p, roles: map[p.id] ?? [] })));
  };

  const setRole = async (userId: string, newRole: Role) => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    if (error) return toast.error(error.message);
    toast.success("Rol actualizado"); load();
  };

  if (!isAdmin) return <div className="text-center py-20 text-muted-foreground">Solo administradores.</div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-sm text-muted-foreground">Gestiona roles y accesos al sistema</p>
      </div>
      <div className="bg-card border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/40">
            <tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Creado</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 font-medium">{u.nombre}</td>
                <td className="px-4 py-3">
                  <Select value={u.roles[0] ?? "usuario"} onValueChange={(v) => setRole(u.id, v as Role)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="coordinador">Coordinador</SelectItem>
                      <SelectItem value="usuario">Usuario</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{format(new Date(u.creado_en), "dd/MM/yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
