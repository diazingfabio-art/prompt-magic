import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { AlertTriangle, AlertCircle, Bell } from "lucide-react";
import { diasRestantes } from "@/lib/activos";

export default function Alertas() {
  const [data, setData] = useState<any>({ vencidas: [], proximas: [], sinResp: [], reparacion: [] });
  useEffect(() => {
    supabase.from("activos").select("*").then(({ data: a }) => {
      const arr = a ?? [];
      setData({
        vencidas: arr.filter((x) => x.estado_garantia === "Expirada"),
        proximas: arr.filter((x) => {
          const d = diasRestantes(x.fecha_vencimiento_garantia);
          return d != null && d >= 0 && d <= 30;
        }),
        sinResp: arr.filter((x) => !x.responsable_actual),
        reparacion: arr.filter((x) => x.estado_operacional === "En Reparacion"),
      });
    });
  }, []);

  const sections = [
    { title: "Garantías vencidas", items: data.vencidas, icon: AlertTriangle, tone: "border-destructive bg-destructive/5 text-destructive" },
    { title: "Garantías por vencer (30 días)", items: data.proximas, icon: AlertCircle, tone: "border-warning bg-warning/5 text-warning" },
    { title: "Activos sin responsable", items: data.sinResp, icon: Bell, tone: "border-warning bg-warning/5 text-warning" },
    { title: "En reparación", items: data.reparacion, icon: AlertCircle, tone: "border-info bg-info/5 text-info" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Alertas</h1>
        <p className="text-sm text-muted-foreground">Atención requerida sobre activos del inventario</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className={`border-l-4 rounded-md p-4 bg-card border ${s.tone.split(" ")[0]}`}>
              <div className={`flex items-center justify-between mb-3 ${s.tone.split(" ")[2]}`}>
                <div className="flex items-center gap-2 font-semibold"><Icon className="h-4 w-4" />{s.title}</div>
                <span className="text-xl font-bold">{s.items.length}</span>
              </div>
              <ul className="space-y-1 text-sm max-h-48 overflow-y-auto">
                {s.items.length === 0 && <li className="text-muted-foreground italic">Sin alertas.</li>}
                {s.items.slice(0, 10).map((it: any) => (
                  <li key={it.id}>
                    <Link to={`/activos/${it.id}`} className="hover:underline">
                      <span className="font-mono text-xs text-muted-foreground">{it.codigo_activo}</span> · {it.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
