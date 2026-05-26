-- org_positions: defines the organisational structure of a society
create table public.org_positions (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references public.societies(id) on delete cascade,
  title text not null,
  tier public.society_role not null default 'member',
  parent_id uuid references public.org_positions(id) on delete set null,
  position_order int not null default 0,
  description text,
  created_at timestamptz not null default now()
);
alter table public.org_positions enable row level security;
create index org_positions_society_idx on public.org_positions(society_id);

create policy "Members can view org positions"
  on public.org_positions for select to authenticated
  using (public.is_society_member(auth.uid(), society_id));

create policy "Executives can manage org positions"
  on public.org_positions for all to authenticated
  using (public.has_society_role(auth.uid(), society_id, 'executive'))
  with check (public.has_society_role(auth.uid(), society_id, 'executive'));

-- position_assignments: maps society members to org positions (pending approval before active)
create table public.position_assignments (
  id uuid primary key default gen_random_uuid(),
  position_id uuid not null references public.org_positions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'active')),
  created_at timestamptz not null default now(),
  unique (position_id, user_id)
);
alter table public.position_assignments enable row level security;
create index position_assignments_position_idx on public.position_assignments(position_id);

create policy "Members can view position assignments"
  on public.position_assignments for select to authenticated
  using (exists (
    select 1 from public.org_positions op
    where op.id = position_id
      and public.is_society_member(auth.uid(), op.society_id)
  ));

create policy "Executives can manage position assignments"
  on public.position_assignments for all to authenticated
  using (exists (
    select 1 from public.org_positions op
    where op.id = position_id
      and public.has_society_role(auth.uid(), op.society_id, 'executive')
  ))
  with check (exists (
    select 1 from public.org_positions op
    where op.id = position_id
      and public.has_society_role(auth.uid(), op.society_id, 'executive')
  ));
