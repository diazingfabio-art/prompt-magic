import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const FIELDS = [
  ["nombre","Nombre"], ["descripcion","Descripción"], ["marca","Marca"],
  ["modelo","Modelo"], ["numero_serie","N° serie"], ["ubicacion","Ubicación"],
  ["ip_asignada","IP asignada"], ["mac_address","MAC"],
  ["proveedor","Proveedor"], ["numero_factura","N° factura"],
  ["valor_compra","Valor compra"], ["fecha_compra","Fecha compra"],
  ["fecha_vencimiento_garantia","Vence garantía"],
  ["notas","Notas"],
] as const;

export default function EditarActivo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStaff } = useAuth();
  const [original, setOriginal] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (id) load(); }, [id]);
  const load = async () => {
    const { data } = await supabase.from("activos").select("*").eq("id", id).single();
    setOriginal(data); setForm(data ?? {});
  };

  if (!isStaff) return <div className="text-center py-20 text-muted-foreground">Sin permisos.</div>;
  if (!original) return <div className="text-center py-20 text-muted-foreground">Cargando…</div>;

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const guardar = async () => {
    setLoading(true);
    const cambios_anteriores: any = {}; const cambios_nuevos: any = {};
    FIELDS.forEach(([k]) => {
      if ((original[k] ?? "") !== (form[k] ?? "")) {
        cambios_anteriores[k] = original[k]; cambios_nuevos[k] = form[k];
      }
    });
    if (!Object.keys(cambios_nuevos).length) {
      setLoading(false); return toast.info("Sin cambios");
    }
    const updates: any = { ...cambios_nuevos, actualizado_por: user?.id };
    if ("valor_compra" in updates) updates.valor_compra = updates.valor_compra ? Number(updates.valor_compra) : null;
    const { error } = await supabase.from("activos").update(updates).eq("id", id);
    if (error) { setLoading(false); return toast.error(error.message); }
    await supabase.from("auditorias").insert({
      usuario_id: user?.id, accion: "Editó activo",
      tabla: "activos", registro_id: id, cambios_anteriores, cambios_nuevos,
    });
    toast.success("Activo actualizado");
    navigate(`/activos/${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm"><Link to={`/activos/${id}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold">Editar activo</h1>
          <p className="text-sm text-muted-foreground font-mono">{original.codigo_activo}</p>
        </div>
      </div>
      <div className="bg-card border rounded-lg p-6 grid sm:grid-cols-2 gap-4">
        {FIELDS.map(([k, l]) => {
          const isDate = k.startsWith("fecha");
          const isLong = k === "descripcion" || k === "notas";
          return (
            <div key={k} className={isLong ? "sm:col-span-2" : ""}>
              <Label>{l}</Label>
              {isLong ? (
                <Textarea value={form[k] ?? ""} onChange={(e) => set(k, e.target.value)} rows={3} />
              ) : (
                <Input
                  type={isDate ? "date" : k === "valor_compra" ? "number" : "text"}
                  value={form[k] ?? ""}
                  onChange={(e) => set(k, e.target.value)}
                />
              )}
              {(original[k] ?? "") !== (form[k] ?? "") && (
                <p className="text-[11px] text-warning mt-1">Modificado · anterior: {String(original[k] ?? "—")}</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-end gap-2">
        <Button asChild variant="outline"><Link to={`/activos/${id}`}>Cancelar</Link></Button>
        <Button onClick={guardar} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Guardar cambios
        </Button>
      </div>
    </div>
  );
}
