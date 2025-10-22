-- Create the storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Set up policies for document access
-- Allow authenticated users to read documents
CREATE POLICY "Allow authenticated read access" ON storage.objects FOR SELECT 
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Allow authenticated users to upload documents
CREATE POLICY "Allow authenticated upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Allow authenticated users to update documents
CREATE POLICY "Allow authenticated update" ON storage.objects FOR UPDATE 
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete documents
CREATE POLICY "Allow authenticated delete" ON storage.objects FOR DELETE 
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
