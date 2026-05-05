import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CATEGORIAS, ESTADOS, ICON_MAP, estadoColor, garantiaColor, formatPYG } from "@/lib/activos";
import { Plus, Download, Search, Eye, Filter } from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "@/contexts/AuthContext";

export default function Activos() {
  const { isStaff } = useAuth();
  const [activos, setActivos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase
      .from("activos")
      .select("*, departamentos(nombre), organizaciones(nombre)")
      .order("creado_en", { ascending: false });
    setActivos(data ?? []);
  };

  const filtered = useMemo(() => {
    return activos.filter((a) => {
      if (filterCat !== "all" && a.categoria !== filterCat) return false;
      if (filterEstado !== "all" && a.estado_operacional !== filterEstado) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return [a.codigo_activo, a.nombre, a.numero_serie, a.responsable_actual, a.marca, a.modelo]
        .filter(Boolean).some((v: string) => v.toLowerCase().includes(q));
    });
  }, [activos, search, filterCat, filterEstado]);

  const exportExcel = () => {
    const rows = filtered.map((a) => ({
      Código: a.codigo_activo, Categoría: a.categoria, Nombre: a.nombre,
      Marca: a.marca, Modelo: a.modelo, Serie: a.numero_serie,
      Responsable: a.responsable_actual, Departamento: a.departamentos?.nombre,
      Estado: a.estado_operacional, Garantía: a.estado_garantia,
      "Valor compra": a.valor_compra, Moneda: a.moneda,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, `inventario-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inventario de Activos</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} de {activos.length} equipos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportExcel}><Download className="h-4 w-4 mr-1" />Excel</Button>
          {isStaff && (
            <Button asChild><Link to="/activos/nuevo"><Plus className="h-4 w-4 mr-1" />Nuevo activo</Link></Button>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por código, nombre, serie, responsable…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
            <Filter className="h-4 w-4 mr-1" /> Filtros
          </Button>
        </div>
        {showFilters && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Categoría</label>
              <Select value={filterCat} onValueChange={setFilterCat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Estado</label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {ESTADOS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/40">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Marca/Modelo</th>
              <th className="px-4 py-3">Serie</th>
              <th className="px-4 py-3">Responsable</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Garantía</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="text-center py-12 text-muted-foreground">
                {activos.length === 0 ? "Aún no hay activos. Comienza registrando uno." : "Sin resultados con los filtros aplicados."}
              </td></tr>
            )}
            {filtered.map((a) => (
              <tr key={a.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{a.codigo_activo}</td>
                <td className="px-4 py-3"><span className="mr-1">{ICON_MAP[a.categoria]}</span>{a.categoria}</td>
                <td className="px-4 py-3 font-medium">{a.nombre}</td>
                <td className="px-4 py-3 text-muted-foreground">{[a.marca, a.modelo].filter(Boolean).join(" ")}</td>
                <td className="px-4 py-3 font-mono text-xs">{a.numero_serie ?? "—"}</td>
                <td className="px-4 py-3">{a.responsable_actual ?? <span className="text-muted-foreground italic">Sin asignar</span>}</td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded font-medium ${estadoColor(a.estado_operacional)}`}>{a.estado_operacional}</span></td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded font-medium ${garantiaColor(a.estado_garantia)}`}>{a.estado_garantia}</span></td>
                <td className="px-4 py-3 whitespace-nowrap">{formatPYG(a.valor_compra, a.moneda)}</td>
                <td className="px-4 py-3">
                  <Button asChild variant="ghost" size="sm"><Link to={`/activos/${a.id}`}><Eye className="h-4 w-4" /></Link></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
