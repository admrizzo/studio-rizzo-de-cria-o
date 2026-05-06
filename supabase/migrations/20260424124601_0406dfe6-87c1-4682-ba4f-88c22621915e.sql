-- Enum de papéis
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'corretor');

-- Tabela user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função SECURITY DEFINER para checar papel sem recursão de RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função para verificar se é admin (admin ou super_admin)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin')
  )
$$;

-- Policies user_roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Permitir que admins leiam/atualizem qualquer profile (para gerenciar fotos)
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Bootstrap: super_admin para diogo, corretor para os demais
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role FROM auth.users WHERE email = 'diogo@souzagomes.com.br'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'corretor'::public.app_role FROM auth.users WHERE email <> 'diogo@souzagomes.com.br'
ON CONFLICT (user_id, role) DO NOTHING;

-- Storage policies: admins podem fazer upload na pasta de qualquer corretor
CREATE POLICY "Admins can upload to any agent folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'agent-photos' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update any agent photo"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'agent-photos' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete any agent photo"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'agent-photos' AND public.is_admin(auth.uid()));