DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Profiles viewable by self or shared society members"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR EXISTS (
    SELECT 1
    FROM public.society_members sm_self
    JOIN public.society_members sm_other
      ON sm_self.society_id = sm_other.society_id
    WHERE sm_self.user_id = auth.uid()
      AND sm_other.user_id = public.profiles.id
  )
);

ALTER TABLE public.waitlist
  DROP CONSTRAINT IF EXISTS waitlist_email_format_chk;

ALTER TABLE public.waitlist
  ADD CONSTRAINT waitlist_email_format_chk
  CHECK (
    char_length(email) <= 254
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

ALTER TABLE public.waitlist
  DROP CONSTRAINT IF EXISTS waitlist_society_name_length_chk;

ALTER TABLE public.waitlist
  ADD CONSTRAINT waitlist_society_name_length_chk
  CHECK (society_name IS NULL OR char_length(society_name) <= 200);