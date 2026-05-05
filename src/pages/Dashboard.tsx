import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  Boxes, AlertTriangle, UserX, DollarSign, Activity, Plus,
  FileBarChart, Bell, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { formatPYG, ICON_MAP, estadoColor } from "@/lib/activos";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

const CHART_COLORS = ["#1F4E78", "#0066CC", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899"];

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0, valor: 0, sinResp: 0, garantiaVencida: 0,
    porEstado: [] as any[], porCategoria: [] as any[], porDepto: [] as any[],
    movsPorDia: [] as any[], ultimosMovs: [] as any[],
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [{ data: activos }, { data: movs }, { data: deps }] = await Promise.all([
      supabase.from("activos").select("*"),
      supabase.from("movimientos_activos").select("*, activos(codigo_activo,nombre)").order("fecha_movimiento",{ascending:false}).limit(50),
      supabase.from("departamentos").select("id,nombre"),
    ]);
    const a = activos ?? [];
    const total = a.length;
    const valor = a.reduce((s, x) => s + Number(x.valor_compra ?? 0), 0);
    const sinResp = a.filter((x) => !x.responsable_actual).length;
    const garantiaVencida = a.filter((x) => x.estado_garantia === "Expirada").length;

    const groupBy = (arr: any[], key: string) => {
      const m: Record<string, number> = {};
      arr.forEach((x) => { const k = x[key] ?? "Sin asignar"; m[k] = (m[k] ?? 0) + 1; });
      return Object.entries(m).map(([name, value]) => ({ name, value }));
    };
    const porEstado = groupBy(a, "estado_operacional");
    const porCategoria = groupBy(a, "categoria");
    const depMap = Object.fromEntries((deps ?? []).map((d) => [d.id, d.nombre]));
    const porDepto = groupBy(a.map((x) => ({ depto: depMap[x.departamento_id] ?? "Sin depto" })), "depto");

    // movs últimos 30 días
    const days: any[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, "yyyy-MM-dd");
      days.push({ fecha: format(d, "dd MMM", { locale: es }), key, count: 0 });
    }
    (movs ?? []).forEach((m) => {
      const k = format(new Date(m.fecha_movimiento), "yyyy-MM-dd");
      const d = days.find((x) => x.key === k); if (d) d.count++;
    });

    setStats({
      total, valor, sinResp, garantiaVencida,
      porEstado, porCategoria, porDepto: porDepto.slice(0, 8),
      movsPorDia: days, ultimosMovs: (movs ?? []).slice(0, 10),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Panel de Control</h1>
          <p className="text-sm text-muted-foreground">Vista general del inventario IT</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link to="/activos/nuevo"><Plus className="mr-1 h-4 w-4" />Registrar Activo</Link></Button>
          <Button asChild variant="outline"><Link to="/reportes"><FileBarChart className="mr-1 h-4 w-4" />Reportes</Link></Button>
          <Button asChild variant="outline"><Link to="/alertas"><Bell className="mr-1 h-4 w-4" />Alertas</Link></Button>
          <Button asChild variant="outline"><Link to="/auditoria"><ShieldCheck className="mr-1 h-4 w-4" />Auditoría</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI icon={Boxes} label="Total de activos" value={stats.total} hl color="text-primary" />
        <KPI icon={Activity} label="Activos operativos" value={stats.porEstado.find((x) => x.name === "Activo")?.value ?? 0} color="text-success" />
        <KPI icon={AlertTriangle} label="Garantía vencida" value={stats.garantiaVencida} color="text-destructive" />
        <KPI icon={UserX} label="Sin responsable" value={stats.sinResp} color="text-warning" />
        <KPI icon={DollarSign} label="Valor del inventario" value={formatPYG(stats.valor)} small color="text-secondary" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Activos por categoría">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stats.porCategoria} dataKey="value" nameKey="name" outerRadius={100} label>
                {stats.porCategoria.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Activos por departamento">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.porDepto}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Movimientos últimos 30 días">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={stats.movsPorDia}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Últimos movimientos">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground border-b">
              <tr>
                <th className="py-2 pr-3">Fecha</th><th className="pr-3">Tipo</th>
                <th className="pr-3">Activo</th><th className="pr-3">Responsable</th>
              </tr>
            </thead>
            <tbody>
              {stats.ultimosMovs.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Sin movimientos registrados aún.</td></tr>
              )}
              {stats.ultimosMovs.map((m) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-2 pr-3 whitespace-nowrap">{format(new Date(m.fecha_movimiento), "dd/MM/yy HH:mm")}</td>
                  <td className="pr-3"><span className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground">{m.tipo_movimiento}</span></td>
                  <td className="pr-3">
                    <Link to={`/activos/${m.activo_id}`} className="text-secondary hover:underline">
                      {m.activos?.codigo_activo} — {m.activos?.nombre}
                    </Link>
                  </td>
                  <td className="pr-3">{m.responsable_nuevo ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function KPI({ icon: Icon, label, value, color = "text-primary", hl = false, small = false }: any) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className={`mt-2 font-bold ${small ? "text-lg" : hl ? "text-3xl" : "text-2xl"} ${color}`}>{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-lg p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
