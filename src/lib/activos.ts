export const CATEGORIAS = [
  "PC","Notebook","Servidor","Impresora","Escaner","Celular","Tablet",
  "Monitor","Teclado","Mouse","UPS","Router","Switch","Otro",
] as const;

export const ESTADOS = ["Activo","Inactivo","En Reparacion","De Baja","En Deposito","Extraviado"] as const;
export const GARANTIAS = ["Vigente","Expirada","Sin Garantia"] as const;
export const TIPOS_MOVIMIENTO = [
  "Compra","Asignacion","Reasignacion","Traslado","Reparacion",
  "Mantenimiento","Baja","Devolucion","Cambio de Responsable",
] as const;

export const ICON_MAP: Record<string, string> = {
  PC: "🖥️", Notebook: "💻", Servidor: "⚙️", Impresora: "🖨️",
  Escaner: "📄", Celular: "📱", Tablet: "📲", Monitor: "🖥️",
  Teclado: "⌨️", Mouse: "🖱️", UPS: "🔋", Router: "📡", Switch: "⚡", Otro: "📦",
};

export function estadoColor(estado: string) {
  const map: Record<string, string> = {
    Activo: "bg-status-activo text-white",
    Inactivo: "bg-status-inactivo text-white",
    "En Reparacion": "bg-status-reparacion text-white",
    "De Baja": "bg-status-baja text-white",
    "En Deposito": "bg-status-deposito text-white",
    Extraviado: "bg-status-extraviado text-white",
  };
  return map[estado] ?? "bg-muted";
}

export function garantiaColor(g: string) {
  return g === "Vigente" ? "bg-success text-success-foreground"
    : g === "Expirada" ? "bg-destructive text-destructive-foreground"
    : "bg-muted text-muted-foreground";
}

export function diasRestantes(fecha: string | null) {
  if (!fecha) return null;
  const dif = new Date(fecha).getTime() - Date.now();
  return Math.ceil(dif / (1000 * 60 * 60 * 24));
}

export function formatPYG(n: number | null | undefined, moneda = "PYG") {
  if (n == null) return "—";
  return new Intl.NumberFormat("es-PY", { style: "currency", currency: moneda, maximumFractionDigits: 0 }).format(n);
}
