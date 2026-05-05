import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Organizaciones() {
  const { isAdmin } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", codigo: "", ciudad: "", pais: "" });

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await supabase.from("organizaciones").select("*").order("nombre");
    setList(data ?? []);
  };
  const save = async () => {
    if (!form.nombre || !form.codigo) return toast.error("Nombre y código requeridos");
    const { error } = await supabase.from("organizaciones").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Organización creada");
    setOpen(false); setForm({ nombre:"", codigo:"", ciudad:"", pais:"" }); load();
  };
  const del = async (id: string) => {
    if (!confirm("¿Eliminar organización?")) return;
    const { error } = await supabase.from("organizaciones").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Organizaciones</h1>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Nueva</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nueva organización</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nombre</Label><Input value={form.nombre} onChange={(e) => setForm({...form,nombre:e.target.value})} /></div>
                <div><Label>Código</Label><Input value={form.codigo} onChange={(e) => setForm({...form,codigo:e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Ciudad</Label><Input value={form.ciudad} onChange={(e) => setForm({...form,ciudad:e.target.value})} /></div>
                  <div><Label>País</Label><Input value={form.pais} onChange={(e) => setForm({...form,pais:e.target.value})} /></div>
                </div>
              </div>
              <DialogFooter><Button onClick={save}>Guardar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="bg-card border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/40">
            <tr><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Código</th><th className="px-4 py-3">Ciudad</th><th className="px-4 py-3">País</th><th></th></tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">Sin organizaciones.</td></tr>}
            {list.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-3 font-medium">{o.nombre}</td>
                <td className="px-4 py-3 font-mono text-xs">{o.codigo}</td>
                <td className="px-4 py-3">{o.ciudad ?? "—"}</td>
                <td className="px-4 py-3">{o.pais ?? "—"}</td>
                <td className="px-4 py-3">{isAdmin && <Button variant="ghost" size="sm" onClick={() => del(o.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
