import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Boxes, PlusCircle, ArrowLeftRight,
  Building2, Users, FileBarChart, ShieldCheck, Bell, Settings, Server,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/activos", label: "Inventario", icon: Boxes },
  { to: "/activos/nuevo", label: "Registrar Activo", icon: PlusCircle, staff: true },
  { to: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
  { to: "/alertas", label: "Alertas", icon: Bell },
  { to: "/reportes", label: "Reportes", icon: FileBarChart },
  { to: "/departamentos", label: "Departamentos", icon: Building2, admin: true },
  { to: "/organizaciones", label: "Organizaciones", icon: Building2, admin: true },
  { to: "/usuarios", label: "Usuarios", icon: Users, admin: true },
  { to: "/auditoria", label: "Auditoría", icon: ShieldCheck, staff: true },
  { to: "/configuracion", label: "Configuración", icon: Settings, admin: true },
];

export default function AppSidebar() {
  const { isAdmin, isStaff } = useAuth();
  const location = useLocation();

  const visible = items.filter((i) => (i.admin ? isAdmin : i.staff ? isStaff : true));

  return (
    <aside
      className="hidden md:flex w-64 shrink-0 flex-col text-sidebar-foreground"
      style={{ background: "var(--gradient-sidebar)" }}
    >
      <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary/20">
          <Server className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <div className="font-bold leading-tight">InventarioTI</div>
          <div className="text-[10px] uppercase tracking-wider opacity-60">Asset Management</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {visible.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="px-4 py-3 text-[11px] text-sidebar-foreground/50 border-t border-sidebar-border">
        v1.0 · {new Date().getFullYear()}
      </div>
    </aside>
  );
}
