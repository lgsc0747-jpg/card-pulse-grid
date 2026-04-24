
-- Replace overly broad SELECT policies that allowed any client to list every
-- file in the public buckets. Public CDN URLs continue to work; only metadata
-- listing via the storage API is restricted to file owners.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for design assets" ON storage.objects;

CREATE POLICY "Owners can list their own avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Owners can list their own design assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'design-assets'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
