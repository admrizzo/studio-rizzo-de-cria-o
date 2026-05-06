-- 1. Limpeza do usuário problemático no Auth
DELETE FROM auth.users WHERE email = 'adm@rizzoimobiliaria.com';

-- 2. Garantir tipo de role
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'corretor');
    END IF;
END $$;

-- 3. Criar a nova tabela studio_profiles (padrão solicitado)
CREATE TABLE IF NOT EXISTS public.studio_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nome TEXT,
    role public.app_role DEFAULT 'corretor'::public.app_role,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Habilitar RLS
ALTER TABLE public.studio_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Atualizar is_admin (Mantendo o nome do parâmetro _user_id para não quebrar dependências)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.studio_profiles
    WHERE id = _user_id AND role IN ('super_admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Políticas para studio_profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.studio_profiles;
CREATE POLICY "Users can read own profile" ON public.studio_profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.studio_profiles;
CREATE POLICY "Admins can read all profiles" ON public.studio_profiles
FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.studio_profiles;
CREATE POLICY "Users can update own profile" ON public.studio_profiles
FOR UPDATE USING (auth.uid() = id);

-- 7. Função e Trigger para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.studio_profiles (id, email, nome, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'nome', 'Usuário Studio'),
    CASE 
      WHEN new.email = 'adm@rizzoimobiliaria.com' THEN 'super_admin'::public.app_role
      ELSE 'corretor'::public.app_role
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Inserir o Super Admin
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  -- confirmed_at omitido por ser gerada
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous,
  aud,
  role
)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'adm@rizzoimobiliaria.com',
  crypt('Rizzo@2025', gen_salt('bf')),
  now(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '', 
  NULL,
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"nome":"Super Admin Rizzo Studio"}',
  FALSE,
  now(),
  now(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL,
  FALSE,
  'authenticated',
  'authenticated'
);
