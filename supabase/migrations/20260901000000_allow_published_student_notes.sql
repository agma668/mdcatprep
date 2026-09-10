-- Allow all authenticated students to read published notes (both official and
-- student-submitted).  Previously, the RLS only let students read published
-- *official* notes and their *own* student notes, so approved student notes
-- were invisible to everyone except the uploader.

-- Drop the old restrictive policy first.
DROP POLICY IF EXISTS "Students can read published official notes." ON public.notes;

-- New policy: any authenticated user can read any published note.
CREATE POLICY "Students can read published notes." ON public.notes
  FOR SELECT TO authenticated
  USING (status = 'published');
