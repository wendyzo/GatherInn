
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.events ALTER COLUMN project_id DROP NOT NULL;

CREATE TABLE IF NOT EXISTS public.runsheet_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  start_time text NOT NULL DEFAULT '09:00',
  duration_minutes integer NOT NULL DEFAULT 30,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.runsheet_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view runsheet blocks"
ON public.runsheet_blocks FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = runsheet_blocks.event_id AND public.is_society_member(auth.uid(), e.society_id)));

CREATE POLICY "Owners/execs can write runsheet blocks"
ON public.runsheet_blocks FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = runsheet_blocks.event_id AND public.can_manage_society(auth.uid(), e.society_id)))
WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = runsheet_blocks.event_id AND public.can_manage_society(auth.uid(), e.society_id)));

CREATE INDEX IF NOT EXISTS runsheet_blocks_event_id_idx ON public.runsheet_blocks(event_id);
