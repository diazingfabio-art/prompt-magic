import { Search, LogOut, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppHeader() {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("activos")
        .select("id,codigo_activo,nombre,categoria,estado_operacional,numero_serie,responsable_actual")
        .or(`codigo_activo.ilike.%${query}%,nombre.ilike.%${query}%,numero_serie.ilike.%${query}%,responsable_actual.ilike.%${query}%`)
        .limit(8);
      setResults(data ?? []);
      setOpen(true);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <header className="h-16 border-b bg-card flex items-center px-6 gap-4">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="global-search"
          placeholder="Buscar por código, serie, nombre, responsable…   (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="pl-9"
        />
        {open && results.length > 0 && (
          <div className="absolute top-full mt-1 w-full bg-popover border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => { navigate(`/activos/${r.id}`); setOpen(false); setQuery(""); }}
                className="w-full text-left px-3 py-2 hover:bg-accent flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-medium">{r.nombre}</div>
                  <div className="text-xs text-muted-foreground">{r.codigo_activo} · {r.categoria}</div>
                </div>
                <span className="text-xs text-muted-foreground">{r.estado_operacional}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium leading-tight">{user?.email}</div>
              <div className="text-[11px] text-muted-foreground capitalize">{roles[0] ?? "usuario"}</div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/perfil")}>
            <UserIcon className="mr-2 h-4 w-4" /> Perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut().then(() => navigate("/auth"))}>
            <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
