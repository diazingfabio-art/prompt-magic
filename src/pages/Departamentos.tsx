import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Departamentos() {
  const { isAdmin } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", organizacion_id: "", responsable: "" });

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await supabase.from("departamentos").select("*, organizaciones(nombre)").order("nombre");
    setList(data ?? []);
    const { data: o } = await supabase.from("organizaciones").select("id,nombre");
    setOrgs(o ?? []);
  };
  const save = async () => {
    if (!form.nombre || !form.organizacion_id) return toast.error("Nombre y organización requeridos");
    const { error } = await supabase.from("departamentos").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Departamento creado");
    setOpen(false); setForm({ nombre: "", organizacion_id: "", responsable: "" }); load();
  };
  const del = async (id: string) => {
    if (!confirm("¿Eliminar departamento?")) return;
    const { error } = await supabase.from("departamentos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Departamentos</h1>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Nuevo</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuevo departamento</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nombre</Label><Input value={form.nombre} onChange={(e) => setForm({...form,nombre:e.target.value})} /></div>
                <div>
                  <Label>Organización</Label>
                  <Select value={form.organizacion_id} onValueChange={(v) => setForm({...form,organizacion_id:v})}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                    <SelectContent>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Responsable</Label><Input value={form.responsable} onChange={(e) => setForm({...form,responsable:e.target.value})} /></div>
              </div>
              <DialogFooter><Button onClick={save}>Guardar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="bg-card border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/40">
            <tr><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Organización</th><th className="px-4 py-3">Responsable</th><th></th></tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">Sin departamentos.</td></tr>}
            {list.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="px-4 py-3 font-medium">{d.nombre}</td>
                <td className="px-4 py-3">{d.organizaciones?.nombre}</td>
                <td className="px-4 py-3">{d.responsable ?? "—"}</td>
                <td className="px-4 py-3">{isAdmin && <Button variant="ghost" size="sm" onClick={() => del(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
