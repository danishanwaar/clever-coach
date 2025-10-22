-- Create storage bucket for contract signatures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contract-signatures',
  'contract-signatures',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg']
);

-- Create policy to allow authenticated users to upload signatures
CREATE POLICY "Allow authenticated users to upload contract signatures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contract-signatures');

-- Create policy to allow public access to view signatures
CREATE POLICY "Allow public access to view contract signatures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'contract-signatures');
