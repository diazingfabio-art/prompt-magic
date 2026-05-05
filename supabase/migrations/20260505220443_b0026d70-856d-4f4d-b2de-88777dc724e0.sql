
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('administrador','coordinador','usuario');
CREATE TYPE public.activo_categoria AS ENUM ('PC','Notebook','Servidor','Impresora','Escaner','Celular','Tablet','Monitor','Teclado','Mouse','UPS','Router','Switch','Otro');
CREATE TYPE public.activo_tipo AS ENUM ('Hardware','Software','Licencia','Otro');
CREATE TYPE public.activo_estado AS ENUM ('Activo','Inactivo','En Reparacion','De Baja','En Deposito','Extraviado');
CREATE TYPE public.garantia_estado AS ENUM ('Vigente','Expirada','Sin Garantia');
CREATE TYPE public.movimiento_tipo AS ENUM ('Compra','Asignacion','Reasignacion','Traslado','Reparacion','Mantenimiento','Baja','Devolucion','Cambio de Responsable');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activo',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('administrador','coordinador'))
$$;

-- ORGANIZACIONES
CREATE TABLE public.organizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  ciudad TEXT,
  pais TEXT,
  codigo TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizaciones ENABLE ROW LEVEL SECURITY;

-- DEPARTAMENTOS
CREATE TABLE public.departamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  organizacion_id UUID NOT NULL REFERENCES public.organizaciones ON DELETE CASCADE,
  responsable TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (nombre, organizacion_id)
);
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;

-- ACTIVOS
CREATE SEQUENCE public.activos_codigo_seq START 1;
CREATE TABLE public.activos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_activo TEXT NOT NULL UNIQUE DEFAULT ('EQUIPO-' || LPAD(nextval('public.activos_codigo_seq')::text, 5, '0')),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria public.activo_categoria NOT NULL,
  tipo public.activo_tipo NOT NULL DEFAULT 'Hardware',
  marca TEXT,
  modelo TEXT,
  numero_serie TEXT UNIQUE,
  version TEXT,
  cantidad INTEGER DEFAULT 1,
  estado_operacional public.activo_estado NOT NULL DEFAULT 'Activo',
  estado_garantia public.garantia_estado NOT NULL DEFAULT 'Sin Garantia',
  fecha_compra DATE,
  fecha_vencimiento_garantia DATE,
  valor_compra NUMERIC(14,2),
  moneda TEXT DEFAULT 'PYG',
  proveedor TEXT,
  numero_factura TEXT,
  numero_contrato TEXT,
  responsable_actual TEXT,
  departamento_id UUID REFERENCES public.departamentos ON DELETE SET NULL,
  organizacion_id UUID REFERENCES public.organizaciones ON DELETE SET NULL,
  ubicacion TEXT,
  ip_asignada TEXT,
  mac_address TEXT,
  usuario_asignado TEXT,
  especificaciones JSONB DEFAULT '{}'::jsonb,
  notas TEXT,
  foto_url TEXT,
  documento_url TEXT,
  estado_documento TEXT DEFAULT 'Pendiente',
  creado_por UUID REFERENCES auth.users,
  actualizado_por UUID REFERENCES auth.users,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activos ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_activos_numero_serie ON public.activos(numero_serie);
CREATE INDEX idx_activos_codigo ON public.activos(codigo_activo);
CREATE INDEX idx_activos_estado ON public.activos(estado_operacional);
CREATE INDEX idx_activos_organizacion ON public.activos(organizacion_id);
CREATE INDEX idx_activos_departamento ON public.activos(departamento_id);

-- MOVIMIENTOS
CREATE TABLE public.movimientos_activos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activo_id UUID NOT NULL REFERENCES public.activos ON DELETE RESTRICT,
  tipo_movimiento public.movimiento_tipo NOT NULL,
  fecha_movimiento TIMESTAMPTZ NOT NULL DEFAULT now(),
  responsable_anterior TEXT,
  responsable_nuevo TEXT,
  departamento_anterior TEXT,
  departamento_nuevo TEXT,
  motivo TEXT,
  costo_asociado NUMERIC(14,2),
  notas TEXT,
  creado_por UUID REFERENCES auth.users,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.movimientos_activos ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_movimientos_activo ON public.movimientos_activos(activo_id);
CREATE INDEX idx_movimientos_fecha ON public.movimientos_activos(fecha_movimiento DESC);

-- AUDITORIA
CREATE TABLE public.auditorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users,
  accion TEXT NOT NULL,
  tabla TEXT,
  registro_id UUID,
  cambios_anteriores JSONB,
  cambios_nuevos JSONB,
  ip_address TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.auditorias ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_auditorias_usuario ON public.auditorias(usuario_id);
CREATE INDEX idx_auditorias_fecha ON public.auditorias(creado_en DESC);

-- TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.actualizado_en = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_activos_updated BEFORE UPDATE ON public.activos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- HANDLE NEW USER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_count INT;
  v_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email,'@',1)));
  SELECT COUNT(*) INTO v_count FROM auth.users;
  v_role := CASE WHEN v_count = 1 THEN 'administrador'::public.app_role ELSE 'usuario'::public.app_role END;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- INMUTABILIDAD MOVIMIENTOS
CREATE OR REPLACE FUNCTION public.prevent_modify_movimientos()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Los movimientos son inmutables y no pueden modificarse ni eliminarse';
END; $$;

CREATE TRIGGER trg_movimientos_no_update BEFORE UPDATE ON public.movimientos_activos
  FOR EACH ROW EXECUTE FUNCTION public.prevent_modify_movimientos();
CREATE TRIGGER trg_movimientos_no_delete BEFORE DELETE ON public.movimientos_activos
  FOR EACH ROW EXECUTE FUNCTION public.prevent_modify_movimientos();

-- RLS POLICIES

-- profiles: cualquier autenticado lee, propios pueden actualizar, admins todo
CREATE POLICY "profiles_select_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'administrador')) WITH CHECK (public.has_role(auth.uid(),'administrador'));

-- user_roles: usuarios ven sus roles; admins gestionan todo
CREATE POLICY "roles_select_self" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'administrador'));
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'administrador')) WITH CHECK (public.has_role(auth.uid(),'administrador'));

-- organizaciones
CREATE POLICY "org_select" ON public.organizaciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "org_admin_all" ON public.organizaciones FOR ALL TO authenticated USING (public.has_role(auth.uid(),'administrador')) WITH CHECK (public.has_role(auth.uid(),'administrador'));

-- departamentos
CREATE POLICY "dep_select" ON public.departamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "dep_admin_all" ON public.departamentos FOR ALL TO authenticated USING (public.has_role(auth.uid(),'administrador')) WITH CHECK (public.has_role(auth.uid(),'administrador'));

-- activos
CREATE POLICY "activos_select" ON public.activos FOR SELECT TO authenticated USING (true);
CREATE POLICY "activos_insert_staff" ON public.activos FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "activos_update_staff" ON public.activos FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "activos_delete_admin" ON public.activos FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'administrador'));

-- movimientos
CREATE POLICY "mov_select" ON public.movimientos_activos FOR SELECT TO authenticated USING (true);
CREATE POLICY "mov_insert_staff" ON public.movimientos_activos FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- auditorias
CREATE POLICY "aud_select_admin" ON public.auditorias FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'administrador') OR public.has_role(auth.uid(),'coordinador'));
CREATE POLICY "aud_insert_auth" ON public.auditorias FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
