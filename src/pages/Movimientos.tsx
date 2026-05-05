import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";

export default function Movimientos() {
  const [movs, setMovs] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("movimientos_activos")
      .select("*, activos(codigo_activo,nombre)")
      .order("fecha_movimiento", { ascending: false })
      .then(({ data }) => setMovs(data ?? []));
  }, []);

  const exportExcel = () => {
    const rows = movs.map((m) => ({
      Fecha: format(new Date(m.fecha_movimiento), "dd/MM/yyyy HH:mm"),
      Tipo: m.tipo_movimiento, Código: m.activos?.codigo_activo,
      Activo: m.activos?.nombre, "Resp. anterior": m.responsable_anterior,
      "Resp. nuevo": m.responsable_nuevo, Motivo: m.motivo,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    XLSX.writeFile(wb, `movimientos-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Movimientos de activos</h1>
          <p className="text-sm text-muted-foreground">Historial inmutable · {movs.length} registros</p>
        </div>
        <Button variant="outline" onClick={exportExcel}><Download className="h-4 w-4 mr-1" />Excel</Button>
      </div>
      <div className="bg-card border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/40">
            <tr>
              <th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Activo</th><th className="px-4 py-3">Resp. anterior</th>
              <th className="px-4 py-3">Resp. nuevo</th><th className="px-4 py-3">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movs.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Sin movimientos.</td></tr>}
            {movs.map((m) => (
              <tr key={m.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 whitespace-nowrap">{format(new Date(m.fecha_movimiento), "dd/MM/yy HH:mm")}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground">{m.tipo_movimiento}</span></td>
                <td className="px-4 py-3"><Link to={`/activos/${m.activo_id}`} className="text-secondary hover:underline">{m.activos?.codigo_activo} — {m.activos?.nombre}</Link></td>
                <td className="px-4 py-3 text-muted-foreground">{m.responsable_anterior ?? "—"}</td>
                <td className="px-4 py-3">{m.responsable_nuevo ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{m.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
