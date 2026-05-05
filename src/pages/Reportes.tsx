import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { toast } from "sonner";

const REPORTES = [
  { id: "inventario", title: "Inventario completo", desc: "Todos los activos con sus detalles" },
  { id: "categoria", title: "Activos por categoría", desc: "Agrupados con cantidades y valores" },
  { id: "garantias", title: "Garantías", desc: "Vigentes, por vencer y vencidas" },
  { id: "movimientos", title: "Movimientos", desc: "Historial completo del período" },
  { id: "sin-responsable", title: "Activos sin responsable", desc: "Equipos pendientes de asignación" },
];

export default function Reportes() {
  const [loading, setLoading] = useState<string | null>(null);

  const generar = async (id: string, formato: "pdf" | "xlsx") => {
    setLoading(id + formato);
    try {
      let rows: any[] = []; let title = "";
      if (id === "inventario") {
        const { data } = await supabase.from("activos").select("*, departamentos(nombre)");
        rows = (data ?? []).map((a: any) => ({
          Código: a.codigo_activo, Categoría: a.categoria, Nombre: a.nombre,
          Marca: a.marca, Modelo: a.modelo, Serie: a.numero_serie,
          Responsable: a.responsable_actual, Departamento: a.departamentos?.nombre,
          Estado: a.estado_operacional, Garantía: a.estado_garantia,
        }));
        title = "Inventario completo";
      } else if (id === "categoria") {
        const { data } = await supabase.from("activos").select("categoria,valor_compra,estado_operacional");
        const m: Record<string, any> = {};
        (data ?? []).forEach((a: any) => {
          if (!m[a.categoria]) m[a.categoria] = { Categoría: a.categoria, Cantidad: 0, "Valor total": 0 };
          m[a.categoria].Cantidad++;
          m[a.categoria]["Valor total"] += Number(a.valor_compra ?? 0);
        });
        rows = Object.values(m); title = "Activos por categoría";
      } else if (id === "garantias") {
        const { data } = await supabase.from("activos").select("codigo_activo,nombre,proveedor,fecha_vencimiento_garantia,estado_garantia");
        rows = (data ?? []).map((a: any) => ({
          Código: a.codigo_activo, Nombre: a.nombre, Proveedor: a.proveedor,
          Vencimiento: a.fecha_vencimiento_garantia, Estado: a.estado_garantia,
        }));
        title = "Reporte de garantías";
      } else if (id === "movimientos") {
        const { data } = await supabase.from("movimientos_activos").select("*,activos(codigo_activo,nombre)").order("fecha_movimiento",{ascending:false});
        rows = (data ?? []).map((m: any) => ({
          Fecha: format(new Date(m.fecha_movimiento),"dd/MM/yyyy HH:mm"), Tipo: m.tipo_movimiento,
          Activo: `${m.activos?.codigo_activo} ${m.activos?.nombre}`,
          "Resp. anterior": m.responsable_anterior, "Resp. nuevo": m.responsable_nuevo, Motivo: m.motivo,
        }));
        title = "Reporte de movimientos";
      } else if (id === "sin-responsable") {
        const { data } = await supabase.from("activos").select("*").is("responsable_actual", null);
        rows = (data ?? []).map((a: any) => ({
          Código: a.codigo_activo, Categoría: a.categoria, Nombre: a.nombre, Ubicación: a.ubicacion,
        }));
        title = "Activos sin responsable";
      }

      if (rows.length === 0) { toast.warning("Sin datos para este reporte."); return; }

      if (formato === "xlsx") {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte");
        XLSX.writeFile(wb, `${id}-${new Date().toISOString().slice(0,10)}.xlsx`);
      } else {
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(16); doc.text("InventarioTI", 14, 18);
        doc.setFontSize(11); doc.text(title, 14, 26);
        doc.setFontSize(9); doc.text(`Generado: ${format(new Date(),"dd/MM/yyyy HH:mm")}  ·  Total: ${rows.length}`, 14, 32);
        autoTable(doc, {
          startY: 38, head: [Object.keys(rows[0])], body: rows.map((r) => Object.values(r).map((v) => v ?? "—")),
          styles: { fontSize: 8 }, headStyles: { fillColor: [31, 78, 120] },
        });
        doc.save(`${id}-${new Date().toISOString().slice(0,10)}.pdf`);
      }
      toast.success("Reporte generado");
    } finally { setLoading(null); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-sm text-muted-foreground">Genera reportes profesionales en PDF o Excel</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTES.map((r) => (
          <div key={r.id} className="bg-card border rounded-lg p-5">
            <FileText className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">{r.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{r.desc}</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => generar(r.id, "pdf")} disabled={loading === r.id + "pdf"}>
                <Download className="h-3.5 w-3.5 mr-1" />PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => generar(r.id, "xlsx")} disabled={loading === r.id + "xlsx"}>
                <Download className="h-3.5 w-3.5 mr-1" />Excel
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
