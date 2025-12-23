-- Enable Admin Deletion for Developers
-- This policy allows users with {"app_role": "dev"} in their User Metadata to delete ALL rows.

CREATE POLICY "Developers can delete any comment"
ON public.comments
FOR DELETE
USING (
  -- Check if the 'app_role' key in the user_metadata JSON equals 'dev'
  (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'dev'
);

-- Note: You might need to drop existing restrictive policies if they conflict,
-- but usually policies are additive (OR logic).
-- If you want to verify it works, run this query to check your current claims:
-- select auth.jwt() -> 'user_metadata';
