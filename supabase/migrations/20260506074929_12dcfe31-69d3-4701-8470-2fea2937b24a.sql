
-- Unique numero_serie (when not null)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_activos_numero_serie ON public.activos(numero_serie) WHERE numero_serie IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activos_estado ON public.activos(estado_operacional);
CREATE INDEX IF NOT EXISTS idx_activos_organizacion ON public.activos(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_activos_departamento ON public.activos(departamento_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_activo ON public.movimientos_activos(activo_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON public.movimientos_activos(fecha_movimiento);

-- Auto-compute warranty status
CREATE OR REPLACE FUNCTION public.compute_estado_garantia()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.fecha_vencimiento_garantia IS NULL THEN
    NEW.estado_garantia := 'Sin Garantia'::garantia_estado;
  ELSIF NEW.fecha_vencimiento_garantia < CURRENT_DATE THEN
    NEW.estado_garantia := 'Expirada'::garantia_estado;
  ELSE
    NEW.estado_garantia := 'Vigente'::garantia_estado;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_compute_estado_garantia ON public.activos;
CREATE TRIGGER trg_compute_estado_garantia
BEFORE INSERT OR UPDATE OF fecha_vencimiento_garantia ON public.activos
FOR EACH ROW EXECUTE FUNCTION public.compute_estado_garantia();

-- Touch updated_at on activos
DROP TRIGGER IF EXISTS trg_touch_activos ON public.activos;
CREATE TRIGGER trg_touch_activos
BEFORE UPDATE ON public.activos
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Bind movimientos immutability triggers
DROP TRIGGER IF EXISTS trg_no_update_mov ON public.movimientos_activos;
CREATE TRIGGER trg_no_update_mov
BEFORE UPDATE ON public.movimientos_activos
FOR EACH ROW EXECUTE FUNCTION public.prevent_modify_movimientos();

DROP TRIGGER IF EXISTS trg_no_delete_mov ON public.movimientos_activos;
CREATE TRIGGER trg_no_delete_mov
BEFORE DELETE ON public.movimientos_activos
FOR EACH ROW EXECUTE FUNCTION public.prevent_modify_movimientos();
