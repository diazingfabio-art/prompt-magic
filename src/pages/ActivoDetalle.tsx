import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, Printer, QrCode } from "lucide-react";
import { ICON_MAP, estadoColor, garantiaColor, formatPYG } from "@/lib/activos";
import { format } from "date-fns";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ActivoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [a, setA] = useState<any>(null);
  const [movs, setMovs] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);

  useEffect(() => { if (id) load(); }, [id]);

  const load = async () => {
    const { data } = await supabase.from("activos").select("*, departamentos(nombre), organizaciones(nombre)").eq("id", id).single();
    setA(data);
    const { data: m } = await supabase.from("movimientos_activos").select("*").eq("activo_id", id).order("fecha_movimiento",{ascending:false});
    setMovs(m ?? []);
    const { data: au } = await supabase.from("auditorias").select("*").eq("registro_id", id).order("creado_en",{ascending:false});
    setAudits(au ?? []);
  };

  const eliminar = async () => {
    if (!confirm("¿Eliminar este activo? Esta acción no se puede deshacer.")) return;
    const { error } = await supabase.from("activos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Activo eliminado");
    navigate("/activos");
  };

  if (!a) return <div className="text-center py-20 text-muted-foreground">Cargando…</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Button asChild variant="ghost" size="sm"><Link to="/activos"><ArrowLeft className="h-4 w-4 mr-1" />Volver al inventario</Link></Button>

      <div className="bg-card border rounded-lg p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex gap-4">
            <div className="h-20 w-20 rounded-lg bg-primary-soft flex items-center justify-center text-4xl">
              {ICON_MAP[a.categoria]}
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-mono">{a.codigo_activo}</div>
              <h1 className="text-2xl font-bold">{a.nombre}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${estadoColor(a.estado_operacional)}`}>{a.estado_operacional}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${garantiaColor(a.estado_garantia)}`}>Garantía: {a.estado_garantia}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground">{a.categoria}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" />Imprimir</Button>
            {isAdmin && <Button variant="outline" size="sm" onClick={eliminar}><Trash2 className="h-4 w-4 mr-1" />Eliminar</Button>}
          </div>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="historial">Historial ({movs.length})</TabsTrigger>
          <TabsTrigger value="qr">Código QR</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoría ({audits.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="bg-card border rounded-lg p-6 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <Field label="Marca">{a.marca}</Field>
            <Field label="Modelo">{a.modelo}</Field>
            <Field label="N° serie" mono>{a.numero_serie}</Field>
            <Field label="Tipo">{a.tipo}</Field>
            <Field label="Organización">{a.organizaciones?.nombre}</Field>
            <Field label="Departamento">{a.departamentos?.nombre}</Field>
            <Field label="Responsable">{a.responsable_actual}</Field>
            <Field label="Ubicación">{a.ubicacion}</Field>
            <Field label="IP">{a.ip_asignada}</Field>
            <Field label="MAC">{a.mac_address}</Field>
            <Field label="Proveedor">{a.proveedor}</Field>
            <Field label="N° factura">{a.numero_factura}</Field>
            <Field label="Fecha compra">{a.fecha_compra ? format(new Date(a.fecha_compra),"dd/MM/yyyy") : null}</Field>
            <Field label="Vence garantía">{a.fecha_vencimiento_garantia ? format(new Date(a.fecha_vencimiento_garantia),"dd/MM/yyyy") : null}</Field>
            <Field label="Valor de compra">{formatPYG(a.valor_compra, a.moneda)}</Field>
            {a.especificaciones && Object.entries(a.especificaciones).map(([k,v]) => (
              <Field key={k} label={k}>{String(v)}</Field>
            ))}
            {a.descripcion && <div className="sm:col-span-2 pt-2 border-t"><div className="text-xs text-muted-foreground">Descripción</div>{a.descripcion}</div>}
            {a.notas && <div className="sm:col-span-2 pt-2 border-t"><div className="text-xs text-muted-foreground">Notas</div>{a.notas}</div>}
          </div>
        </TabsContent>

        <TabsContent value="historial">
          <div className="bg-card border rounded-lg p-6">
            {movs.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sin movimientos.</p>
            ) : (
              <ol className="relative border-l border-border ml-2 space-y-5">
                {movs.map((m) => (
                  <li key={m.id} className="ml-5">
                    <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-primary" />
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-semibold">{m.tipo_movimiento}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(m.fecha_movimiento), "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    {(m.responsable_anterior || m.responsable_nuevo) && (
                      <div className="text-sm text-muted-foreground">Responsable: {m.responsable_anterior ?? "—"} → <strong className="text-foreground">{m.responsable_nuevo ?? "—"}</strong></div>
                    )}
                    {m.motivo && <div className="text-sm mt-1">{m.motivo}</div>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </TabsContent>

        <TabsContent value="qr">
          <div className="bg-card border rounded-lg p-6 flex flex-col items-center gap-4">
            <QRCodeCanvas value={`${window.location.origin}/activos/${a.id}`} size={220} />
            <div className="text-sm text-muted-foreground">Escanea para acceder al detalle</div>
            <div className="font-mono text-sm">{a.codigo_activo}</div>
          </div>
        </TabsContent>

        <TabsContent value="auditoria">
          <div className="bg-card border rounded-lg p-6 text-sm">
            {audits.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">Sin registros de auditoría.</p>
            ) : (
              <table className="w-full">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                  <tr><th className="py-2">Fecha</th><th>Acción</th><th>Tabla</th></tr>
                </thead>
                <tbody>
                  {audits.map((au) => (
                    <tr key={au.id} className="border-b last:border-0">
                      <td className="py-2">{format(new Date(au.creado_en),"dd/MM/yyyy HH:mm")}</td>
                      <td>{au.accion}</td><td>{au.tabla}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children, mono = false }: any) {
  if (!children) return null;
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : ""}>{children}</div>
    </div>
  );
}
