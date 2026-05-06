import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ESTADOS } from "@/lib/activos";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { UserCog, MapPin, Activity, Wrench, Ban } from "lucide-react";

type AccionTipo = "responsable" | "departamento" | "estado" | "mantenimiento" | "baja";

const TITULOS: Record<AccionTipo, string> = {
  responsable: "Cambiar responsable",
  departamento: "Cambiar departamento",
  estado: "Cambiar estado operacional",
  mantenimiento: "Registrar mantenimiento / reparación",
  baja: "Dar de baja el activo",
};

const TIPO_MOV: Record<AccionTipo, string> = {
  responsable: "Reasignación",
  departamento: "Traslado",
  estado: "Cambio de Responsable",
  mantenimiento: "Mantenimiento",
  baja: "Baja",
};

export default function AccionesActivo({
  activo, onChange,
}: { activo: any; onChange: () => void }) {
  const { user, isStaff } = useAuth();
  const [accion, setAccion] = useState<AccionTipo | null>(null);
  const [deps, setDeps] = useState<any[]>([]);
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");
  const [costo, setCosto] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accion === "departamento") {
      supabase.from("departamentos").select("id,nombre").then(({ data }) => setDeps(data ?? []));
    }
    setValor(""); setMotivo(""); setCosto("");
  }, [accion]);

  if (!isStaff) return null;

  const ejecutar = async () => {
    if (!accion) return;
    setLoading(true);
    const cambios_anteriores: any = {};
    const cambios_nuevos: any = {};
    const updates: any = {};
    const mov: any = {
      activo_id: activo.id, tipo_movimiento: TIPO_MOV[accion],
      motivo: motivo || null, creado_por: user?.id,
      costo_asociado: costo ? Number(costo) : null,
    };

    if (accion === "responsable") {
      if (!valor) { setLoading(false); return toast.error("Indica el nuevo responsable"); }
      cambios_anteriores.responsable_actual = activo.responsable_actual;
      cambios_nuevos.responsable_actual = valor;
      updates.responsable_actual = valor;
      mov.responsable_anterior = activo.responsable_actual;
      mov.responsable_nuevo = valor;
    } else if (accion === "departamento") {
      if (!valor) { setLoading(false); return toast.error("Selecciona el nuevo departamento"); }
      const nuevo = deps.find((d) => d.id === valor)?.nombre;
      cambios_anteriores.departamento_id = activo.departamento_id;
      cambios_nuevos.departamento_id = valor;
      updates.departamento_id = valor;
      mov.departamento_anterior = activo.departamentos?.nombre ?? null;
      mov.departamento_nuevo = nuevo ?? null;
    } else if (accion === "estado") {
      if (!valor) { setLoading(false); return toast.error("Selecciona el nuevo estado"); }
      cambios_anteriores.estado_operacional = activo.estado_operacional;
      cambios_nuevos.estado_operacional = valor;
      updates.estado_operacional = valor;
      mov.tipo_movimiento = "Cambio de Responsable";
    } else if (accion === "mantenimiento") {
      // No cambia activo, solo registra movimiento
    } else if (accion === "baja") {
      if (!motivo) { setLoading(false); return toast.error("El motivo de baja es obligatorio"); }
      cambios_anteriores.estado_operacional = activo.estado_operacional;
      cambios_nuevos.estado_operacional = "De Baja";
      updates.estado_operacional = "De Baja";
    }

    if (Object.keys(updates).length) {
      updates.actualizado_por = user?.id;
      const { error } = await supabase.from("activos").update(updates).eq("id", activo.id);
      if (error) { setLoading(false); return toast.error(error.message); }
    }

    const { error: mErr } = await supabase.from("movimientos_activos").insert(mov);
    if (mErr) { setLoading(false); return toast.error(mErr.message); }

    if (Object.keys(cambios_nuevos).length) {
      await supabase.from("auditorias").insert({
        usuario_id: user?.id, accion: TITULOS[accion],
        tabla: "activos", registro_id: activo.id,
        cambios_anteriores, cambios_nuevos,
      });
    }

    toast.success("Acción registrada");
    setLoading(false);
    setAccion(null);
    onChange();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setAccion("responsable")}>
          <UserCog className="h-4 w-4 mr-1" /> Cambiar responsable
        </Button>
        <Button size="sm" variant="outline" onClick={() => setAccion("departamento")}>
          <MapPin className="h-4 w-4 mr-1" /> Cambiar departamento
        </Button>
        <Button size="sm" variant="outline" onClick={() => setAccion("estado")}>
          <Activity className="h-4 w-4 mr-1" /> Cambiar estado
        </Button>
        <Button size="sm" variant="outline" onClick={() => setAccion("mantenimiento")}>
          <Wrench className="h-4 w-4 mr-1" /> Mantenimiento
        </Button>
        <Button size="sm" variant="destructive" onClick={() => setAccion("baja")}>
          <Ban className="h-4 w-4 mr-1" /> Dar de baja
        </Button>
      </div>

      <Dialog open={!!accion} onOpenChange={(o) => !o && setAccion(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{accion && TITULOS[accion]}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {accion === "responsable" && (
              <div>
                <Label>Nuevo responsable</Label>
                <Input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Nombre completo" />
                <p className="text-xs text-muted-foreground mt-1">Anterior: {activo.responsable_actual ?? "Sin asignar"}</p>
              </div>
            )}
            {accion === "departamento" && (
              <div>
                <Label>Nuevo departamento</Label>
                <Select value={valor} onValueChange={setValor}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                  <SelectContent>{deps.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Anterior: {activo.departamentos?.nombre ?? "—"}</p>
              </div>
            )}
            {accion === "estado" && (
              <div>
                <Label>Nuevo estado</Label>
                <Select value={valor} onValueChange={setValor}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                  <SelectContent>{ESTADOS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Actual: {activo.estado_operacional}</p>
              </div>
            )}
            {accion === "mantenimiento" && (
              <div>
                <Label>Costo asociado (opcional)</Label>
                <Input type="number" value={costo} onChange={(e) => setCosto(e.target.value)} />
              </div>
            )}
            <div>
              <Label>{accion === "baja" ? "Motivo de baja *" : "Motivo / observaciones"}</Label>
              <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccion(null)}>Cancelar</Button>
            <Button onClick={ejecutar} disabled={loading}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
