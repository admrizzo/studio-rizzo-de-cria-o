-- Create storage bucket for static audio assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-assets', 'audio-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for audio assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-assets');

-- Allow service role to upload
CREATE POLICY "Service role can upload audio assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio-assets');