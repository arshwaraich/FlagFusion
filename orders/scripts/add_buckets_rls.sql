-- Policy: Anyone can read/select from the bucket
CREATE POLICY "public_read" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'flags');

-- Policy: Only edge functions can upload/insert
CREATE POLICY "edge_functions_upload_only" ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'flags');

-- Policy: Only edge functions can update
CREATE POLICY "edge_functions_update_only" ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'flags')
WITH CHECK (bucket_id = 'flags');

-- Policy: Only edge functions can delete
CREATE POLICY "edge_functions_delete_only" ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'flags');