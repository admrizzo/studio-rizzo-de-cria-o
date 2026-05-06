-- 1. Tabelas Principais com prefixo module_proposals_

CREATE TABLE public.module_proposals_data (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    secure_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT NOT NULL,
    client_email TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'sent', 'responded', 'completed', 'cancelled')),
    internal_user_id UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.module_proposals_correction_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID NOT NULL REFERENCES public.module_proposals_data(id) ON DELETE CASCADE,
    request_reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'cancelled')),
    requested_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.module_proposals_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID NOT NULL REFERENCES public.module_proposals_data(id) ON DELETE CASCADE,
    correction_request_id UUID REFERENCES public.module_proposals_correction_requests(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    uploaded_by_client BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS em todas as tabelas
ALTER TABLE public.module_proposals_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_proposals_correction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_proposals_documents ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acesso (Policies)

-- Propostas: Internos veem tudo, Público vê apenas via Token
CREATE POLICY "Internal users can manage all proposals" 
ON public.module_proposals_data FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view proposal via secure token" 
ON public.module_proposals_data FOR SELECT 
USING (true); -- Filtro será feito na query pelo secure_token no frontend

-- Correções: Internos gerenciam, Público vê via Proposta
CREATE POLICY "Internal users can manage corrections" 
ON public.module_proposals_correction_requests FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view related corrections" 
ON public.module_proposals_correction_requests FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.module_proposals_data p 
    WHERE p.id = proposal_id
));

-- Documentos: Internos veem tudo, Público insere e vê os seus
CREATE POLICY "Internal users can manage documents" 
ON public.module_proposals_documents FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Public can insert documents via proposal" 
ON public.module_proposals_documents FOR INSERT 
WITH CHECK (true); -- Controle via app logic usando o token da proposta

CREATE POLICY "Public can view proposal documents" 
ON public.module_proposals_documents FOR SELECT 
USING (true);

-- 4. Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('module_proposals_documents', 'module_proposals_documents', false);

CREATE POLICY "Internal users full access to storage" 
ON storage.objects FOR ALL 
USING (bucket_id = 'module_proposals_documents' AND auth.role() = 'authenticated');

CREATE POLICY "Public can upload documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'module_proposals_documents');

CREATE POLICY "Public can read documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'module_proposals_documents');

-- 5. Funções de Timestamp e Triggers
CREATE OR REPLACE FUNCTION public.handle_module_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_proposals_timestamp
BEFORE UPDATE ON public.module_proposals_data
FOR EACH ROW EXECUTE FUNCTION public.handle_module_proposals_updated_at();

CREATE TRIGGER update_corrections_timestamp
BEFORE UPDATE ON public.module_proposals_correction_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_module_proposals_updated_at();
