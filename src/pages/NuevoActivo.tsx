import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CATEGORIAS, ESTADOS } from "@/lib/activos";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function NuevoActivo() {
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [deps, setDeps] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    categoria: "PC", nombre: "", descripcion: "",
    marca: "", modelo: "", numero_serie: "",
    estado_operacional: "Activo", estado_garantia: "Sin Garantia",
    moneda: "PYG", tipo: "Hardware",
    departamento_id: "", organizacion_id: "",
    responsable_actual: "", ubicacion: "",
    fecha_compra: "", fecha_vencimiento_garantia: "",
    valor_compra: "", proveedor: "", numero_factura: "",
    ip_asignada: "", mac_address: "", notas: "",
    especificaciones: {},
  });

  useEffect(() => {
    supabase.from("departamentos").select("id,nombre").then(({ data }) => setDeps(data ?? []));
    supabase.from("organizaciones").select("id,nombre").then(({ data }) => setOrgs(data ?? []));
  }, []);

  if (!isStaff) {
    return <div className="text-center py-20 text-muted-foreground">No tienes permisos para registrar activos.</div>;
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const setSpec = (k: string, v: any) => setForm((f: any) => ({ ...f, especificaciones: { ...f.especificaciones, [k]: v } }));

  const computeGarantia = (fecha: string) => {
    if (!fecha) return "Sin Garantia";
    const d = new Date(fecha).getTime() - Date.now();
    return d < 0 ? "Expirada" : "Vigente";
  };

  const submit = async () => {
    if (!form.nombre) return toast.error("El nombre es obligatorio");
    setLoading(true);
    const payload: any = {
      ...form,
      valor_compra: form.valor_compra ? Number(form.valor_compra) : null,
      fecha_compra: form.fecha_compra || null,
      fecha_vencimiento_garantia: form.fecha_vencimiento_garantia || null,
      departamento_id: form.departamento_id || null,
      organizacion_id: form.organizacion_id || null,
      numero_serie: form.numero_serie || null,
      estado_garantia: computeGarantia(form.fecha_vencimiento_garantia),
      creado_por: user?.id,
      actualizado_por: user?.id,
    };

    const { data, error } = await supabase.from("activos").insert(payload).select().single();
    if (error) { setLoading(false); return toast.error(error.message); }

    await supabase.from("movimientos_activos").insert({
      activo_id: data.id, tipo_movimiento: "Compra",
      responsable_nuevo: form.responsable_actual || null,
      motivo: "Alta inicial del activo en el sistema",
      creado_por: user?.id,
    });

    await supabase.from("auditorias").insert({
      usuario_id: user?.id, accion: "Creó activo",
      tabla: "activos", registro_id: data.id, cambios_nuevos: payload,
    });

    toast.success(`Activo registrado: ${data.codigo_activo}`);
    navigate(`/activos/${data.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm"><Link to="/activos"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold">Registrar nuevo activo</h1>
          <p className="text-sm text-muted-foreground">Paso {step} de 4</p>
        </div>
      </div>

      <div className="flex gap-1">
        {[1,2,3,4].map((n) => (
          <div key={n} className={`flex-1 h-1.5 rounded ${n <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-4">
        {step === 1 && (
          <>
            <h2 className="font-semibold">Información básica</h2>
            <div>
              <Label>Categoría *</Label>
              <Select value={form.categoria} onValueChange={(v) => set("categoria", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nombre *</Label>
              <Input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: PC Administración - Juan" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} rows={3} />
            </div>
            <p className="text-xs text-muted-foreground">El código de activo se genera automáticamente al guardar (formato EQUIPO-NNNNN).</p>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-semibold">Especificaciones técnicas</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Marca</Label><Input value={form.marca} onChange={(e) => set("marca", e.target.value)} /></div>
              <div><Label>Modelo</Label><Input value={form.modelo} onChange={(e) => set("modelo", e.target.value)} /></div>
              <div><Label>Número de serie</Label><Input value={form.numero_serie} onChange={(e) => set("numero_serie", e.target.value)} /></div>
              {(form.categoria === "PC" || form.categoria === "Notebook" || form.categoria === "Servidor") && (
                <>
                  <div><Label>Sistema operativo</Label><Input onChange={(e) => setSpec("so", e.target.value)} /></div>
                  <div><Label>Procesador</Label><Input onChange={(e) => setSpec("cpu", e.target.value)} /></div>
                  <div><Label>RAM (GB)</Label><Input type="number" onChange={(e) => setSpec("ram_gb", e.target.value)} /></div>
                  <div><Label>Almacenamiento (GB)</Label><Input type="number" onChange={(e) => setSpec("disco_gb", e.target.value)} /></div>
                  <div><Label>IP asignada</Label><Input value={form.ip_asignada} onChange={(e) => set("ip_asignada", e.target.value)} /></div>
                  <div><Label>MAC address</Label><Input value={form.mac_address} onChange={(e) => set("mac_address", e.target.value)} /></div>
                </>
              )}
              {(form.categoria === "Celular" || form.categoria === "Tablet") && (
                <>
                  <div><Label>IMEI</Label><Input onChange={(e) => setSpec("imei", e.target.value)} /></div>
                  <div><Label>Operadora</Label><Input onChange={(e) => setSpec("operadora", e.target.value)} /></div>
                  <div><Label>Número de línea</Label><Input onChange={(e) => setSpec("linea", e.target.value)} /></div>
                </>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-semibold">Información administrativa</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Organización</Label>
                <Select value={form.organizacion_id} onValueChange={(v) => set("organizacion_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                  <SelectContent>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Departamento</Label>
                <Select value={form.departamento_id} onValueChange={(v) => set("departamento_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                  <SelectContent>{deps.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Responsable actual</Label><Input value={form.responsable_actual} onChange={(e) => set("responsable_actual", e.target.value)} /></div>
              <div><Label>Ubicación</Label><Input value={form.ubicacion} onChange={(e) => set("ubicacion", e.target.value)} /></div>
              <div>
                <Label>Estado operacional</Label>
                <Select value={form.estado_operacional} onValueChange={(v) => set("estado_operacional", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ESTADOS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="font-semibold">Información financiera y garantía</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Fecha de compra</Label><Input type="date" value={form.fecha_compra} onChange={(e) => set("fecha_compra", e.target.value)} /></div>
              <div><Label>Vencimiento de garantía</Label><Input type="date" value={form.fecha_vencimiento_garantia} onChange={(e) => set("fecha_vencimiento_garantia", e.target.value)} /></div>
              <div><Label>Valor de compra</Label><Input type="number" value={form.valor_compra} onChange={(e) => set("valor_compra", e.target.value)} /></div>
              <div>
                <Label>Moneda</Label>
                <Select value={form.moneda} onValueChange={(v) => set("moneda", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PYG">PYG (Guaraní)</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Proveedor</Label><Input value={form.proveedor} onChange={(e) => set("proveedor", e.target.value)} /></div>
              <div><Label>N° factura</Label><Input value={form.numero_factura} onChange={(e) => set("numero_factura", e.target.value)} /></div>
            </div>
            <div><Label>Notas</Label><Textarea value={form.notas} onChange={(e) => set("notas", e.target.value)} rows={3} /></div>
          </>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>◄ Anterior</Button>
          {step < 4 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Siguiente ►</Button>
          ) : (
            <Button onClick={submit} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Guardar activo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
