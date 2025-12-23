-- Enable Admin Deletion for Developers
-- This policy allows users with {"app_role": "dev"} in their User Metadata to delete ALL tags.

CREATE POLICY "Developers can delete any tag"
ON public.tags
FOR DELETE
USING (
  -- Check if the 'app_role' key in the user_metadata JSON equals 'dev'
  (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'dev'
);

-- Note: This is required because standard users can only delete their own custom tags.
-- The Dev Role override allows cleaning up bad data (like typo tags or inappropriate content).
