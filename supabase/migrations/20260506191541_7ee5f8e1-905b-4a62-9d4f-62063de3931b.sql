-- Create studio_brand_settings table
CREATE TABLE IF NOT EXISTS public.studio_brand_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT,
    contato TEXT,
    whatsapp TEXT,
    logo_url TEXT,
    cor_primaria TEXT DEFAULT '#39FF14',
    cor_secundaria TEXT DEFAULT '#ec5a8a',
    video_display JSONB DEFAULT '{"showLogo": true, "showBrandName": true, "showPrice": true, "showStats": true, "showLocation": true, "showAIPhrases": true, "showContact": true, "showProgressBar": true}'::jsonb,
    slide_speed TEXT DEFAULT 'normal',
    feed_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.studio_brand_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access for studio brand settings"
ON public.studio_brand_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage studio brand settings"
ON public.studio_brand_settings FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.studio_brand_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default settings if not exists
INSERT INTO public.studio_brand_settings (nome, cor_primaria, cor_secundaria)
SELECT 'Rizzo Imobiliária', '#39FF14', '#ec5a8a'
WHERE NOT EXISTS (SELECT 1 FROM public.studio_brand_settings);
