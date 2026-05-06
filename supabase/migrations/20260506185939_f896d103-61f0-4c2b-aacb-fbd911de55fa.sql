-- Migration to repair Studio auth and profiles
-- 1. Ensure studio_profiles is the source of truth
-- 2. Update functions to use studio_profiles
-- 3. Setup RLS

-- Update is_admin function (using correct parameter name _user_id)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.studio_profiles
    WHERE id = _user_id AND role::text IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update has_role function (using correct parameter names and types)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.studio_profiles
    WHERE id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS on studio_profiles
ALTER TABLE public.studio_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for studio_profiles
DROP POLICY IF EXISTS "Users can view their own studio profile" ON public.studio_profiles;
CREATE POLICY "Users can view their own studio profile"
ON public.studio_profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all studio profiles" ON public.studio_profiles;
CREATE POLICY "Admins can view all studio profiles"
ON public.studio_profiles FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own studio profile" ON public.studio_profiles;
CREATE POLICY "Users can update their own studio profile"
ON public.studio_profiles FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all studio profiles" ON public.studio_profiles;
CREATE POLICY "Admins can manage all studio profiles"
ON public.studio_profiles FOR ALL
USING (public.is_admin(auth.uid()));

-- Sync super admin to old tables if they exist (compatibility)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    INSERT INTO public.profiles (id, nome)
    SELECT id, nome FROM public.studio_profiles WHERE role::text = 'super_admin'
    ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, role FROM public.studio_profiles WHERE role::text = 'super_admin'
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;