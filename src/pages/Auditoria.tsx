import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function Auditoria() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("auditorias").select("*, profiles(nombre,email)").order("creado_en", { ascending: false }).limit(500)
      .then(({ data }) => setList(data ?? []));
  }, []);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Auditoría</h1>
        <p className="text-sm text-muted-foreground">Registro inmutable de todas las modificaciones del sistema</p>
      </div>
      <div className="bg-card border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/40">
            <tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Acción</th><th className="px-4 py-3">Tabla</th><th className="px-4 py-3">Registro</th></tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">Sin registros.</td></tr>}
            {list.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-3 whitespace-nowrap">{format(new Date(a.creado_en), "dd/MM/yy HH:mm")}</td>
                <td className="px-4 py-3">{(a as any).profiles?.nombre ?? "Sistema"}</td>
                <td className="px-4 py-3">{a.accion}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.tabla}</td>
                <td className="px-4 py-3 font-mono text-xs">{a.registro_id?.slice(0, 8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
