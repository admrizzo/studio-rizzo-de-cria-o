-- 1. Limpeza e Garantia de Chave Primária
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_admin_user();

-- Ajustar a tabela user_roles para garantir que possamos inserir/atualizar sem erros de restrição
DO $$ 
BEGIN
    -- Se existir uma PK, removemos para garantir que a PK seja baseada apenas no user_id
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'user_roles' AND constraint_type = 'PRIMARY KEY') THEN
        ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
    END IF;

    -- Limpar duplicados
    DELETE FROM public.user_roles a USING public.user_roles b WHERE a.ctid < b.ctid AND a.user_id = b.user_id;
    
    -- Criar PK única por usuário
    ALTER TABLE public.user_roles ADD PRIMARY KEY (user_id);
END $$;

-- 2. Criar Usuário Admin no Auth
DO $$ 
DECLARE 
    admin_id UUID := 'f0000000-0000-0000-0000-000000000001'; 
BEGIN
    -- Se não existir no auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adm@rizzoimobiliaria.com') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
            confirmation_token, recovery_token, email_change_token_new
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated', 
            'adm@rizzoimobiliaria.com', crypt('Rizzo@2025', gen_salt('bf')), 
            now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Super Admin Rizzo Studio"}', 
            now(), now(), '', '', ''
        );

        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(), admin_id, 
            format('{"sub":"%s","email":"%s"}', admin_id, 'adm@rizzoimobiliaria.com')::jsonb, 
            'email', admin_id::text, now(), now(), now()
        );
    END IF;

    SELECT id INTO admin_id FROM auth.users WHERE email = 'adm@rizzoimobiliaria.com';

    -- 3. Criar Perfil e Role
    INSERT INTO public.profiles (id, nome, created_at, updated_at)
    VALUES (admin_id, 'Super Admin Rizzo Studio', now(), now())
    ON CONFLICT (id) DO UPDATE SET nome = 'Super Admin Rizzo Studio';

    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_id, 'super_admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
END $$;
