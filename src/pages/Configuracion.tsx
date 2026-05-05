export default function Configuracion() {
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground">Personaliza el sistema según tus necesidades</p>
      </div>
      <div className="bg-card border rounded-lg p-6 space-y-3 text-sm">
        <h3 className="font-semibold">Categorías de activos</h3>
        <p className="text-muted-foreground">Las categorías predeterminadas son: PC, Notebook, Servidor, Impresora, Escáner, Celular, Tablet, Monitor, Teclado, Mouse, UPS, Router, Switch y Otro.</p>
        <p className="text-muted-foreground">Para agregar nuevas categorías o estados personalizados, contacta al equipo técnico para extender el modelo de datos.</p>
      </div>
      <div className="bg-card border rounded-lg p-6 space-y-3 text-sm">
        <h3 className="font-semibold">Formato de código de activo</h3>
        <p className="text-muted-foreground">Actualmente: <code className="font-mono">EQUIPO-NNNNN</code> (autoincremental).</p>
      </div>
      <div className="bg-card border rounded-lg p-6 space-y-3 text-sm">
        <h3 className="font-semibold">Monedas disponibles</h3>
        <p className="text-muted-foreground">PYG (Guaraní), USD, EUR.</p>
      </div>
    </div>
  );
}
