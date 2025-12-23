-- Ensure Tag Deletion Cascades to Item Tags
-- This ensures that when you delete a Tag, all links to items (tracks/albums) are also deleted automatically.

-- 1. Drop existing constraint if it exists (assuming standard naming convention)
ALTER TABLE public.item_tags
DROP CONSTRAINT IF EXISTS item_tags_tag_id_fkey;

-- 2. Re-add constraint with ON DELETE CASCADE
ALTER TABLE public.item_tags
ADD CONSTRAINT item_tags_tag_id_fkey
FOREIGN KEY (tag_id)
REFERENCES public.tags(id)
ON DELETE CASCADE;

-- Optional: Do the same for the user_id if you want deleting a user to remove their tag usage
-- ALTER TABLE public.item_tags
-- DROP CONSTRAINT IF EXISTS item_tags_user_id_fkey;
-- ALTER TABLE public.item_tags
-- ADD CONSTRAINT item_tags_user_id_fkey
-- FOREIGN KEY (user_id)
-- REFERENCES auth.users(id)
-- ON DELETE CASCADE;
