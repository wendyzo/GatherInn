
-- Roles enum
create type public.society_role as enum ('executive', 'project_owner', 'member');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  skills text[] not null default '{}',
  experience_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);
create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Societies
create table public.societies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
alter table public.societies enable row level security;

-- Society membership
create table public.society_members (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references public.societies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.society_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (society_id, user_id)
);
alter table public.society_members enable row level security;

-- Security definer helpers (avoid recursive RLS)
create or replace function public.has_society_role(_user_id uuid, _society_id uuid, _role public.society_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.society_members
    where user_id = _user_id and society_id = _society_id and role = _role
  );
$$;

create or replace function public.is_society_member(_user_id uuid, _society_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.society_members
    where user_id = _user_id and society_id = _society_id
  );
$$;

create or replace function public.can_manage_society(_user_id uuid, _society_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.society_members
    where user_id = _user_id and society_id = _society_id
      and role in ('executive', 'project_owner')
  );
$$;

-- Auto-add creator as executive
create or replace function public.handle_new_society()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.society_members (society_id, user_id, role)
  values (new.id, new.created_by, 'executive');
  return new;
end;
$$;
create trigger on_society_created
  after insert on public.societies
  for each row execute function public.handle_new_society();

-- Society policies
create policy "Members can view their societies"
  on public.societies for select to authenticated
  using (public.is_society_member(auth.uid(), id));
create policy "Any authenticated user can create a society"
  on public.societies for insert to authenticated
  with check (auth.uid() = created_by);
create policy "Executives can update their society"
  on public.societies for update to authenticated
  using (public.has_society_role(auth.uid(), id, 'executive'));

-- society_members policies
create policy "Members can view membership of their societies"
  on public.society_members for select to authenticated
  using (public.is_society_member(auth.uid(), society_id));
create policy "Executives can manage members"
  on public.society_members for insert to authenticated
  with check (public.has_society_role(auth.uid(), society_id, 'executive'));
create policy "Executives can update members"
  on public.society_members for update to authenticated
  using (public.has_society_role(auth.uid(), society_id, 'executive'));
create policy "Executives can remove members"
  on public.society_members for delete to authenticated
  using (public.has_society_role(auth.uid(), society_id, 'executive'));

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references public.societies(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
alter table public.projects enable row level security;

create policy "Members can view projects"
  on public.projects for select to authenticated
  using (public.is_society_member(auth.uid(), society_id));
create policy "Owners/execs can create projects"
  on public.projects for insert to authenticated
  with check (public.can_manage_society(auth.uid(), society_id) and auth.uid() = created_by);
create policy "Owners/execs can update projects"
  on public.projects for update to authenticated
  using (public.can_manage_society(auth.uid(), society_id));
create policy "Owners/execs can delete projects"
  on public.projects for delete to authenticated
  using (public.can_manage_society(auth.uid(), society_id));

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  society_id uuid not null references public.societies(id) on delete cascade,
  name text not null,
  description text,
  event_date date,
  status text not null default 'planning',
  cloned_from_event_id uuid references public.events(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
alter table public.events enable row level security;
create index events_society_idx on public.events(society_id);
create index events_project_idx on public.events(project_id);

create policy "Members can view events"
  on public.events for select to authenticated
  using (public.is_society_member(auth.uid(), society_id));
create policy "Owners/execs can create events"
  on public.events for insert to authenticated
  with check (public.can_manage_society(auth.uid(), society_id) and auth.uid() = created_by);
create policy "Owners/execs can update events"
  on public.events for update to authenticated
  using (public.can_manage_society(auth.uid(), society_id));
create policy "Owners/execs can delete events"
  on public.events for delete to authenticated
  using (public.can_manage_society(auth.uid(), society_id));

-- Event tasks (Timeline)
create table public.event_tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  completed boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.event_tasks enable row level security;
create index event_tasks_event_idx on public.event_tasks(event_id);

create policy "Members can view tasks"
  on public.event_tasks for select to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = event_id and public.is_society_member(auth.uid(), e.society_id)
  ));
create policy "Owners/execs can write tasks"
  on public.event_tasks for all to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = event_id and public.can_manage_society(auth.uid(), e.society_id)
  ))
  with check (exists (
    select 1 from public.events e
    where e.id = event_id and public.can_manage_society(auth.uid(), e.society_id)
  ));

-- Event vendors
create table public.event_vendors (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  service text,
  contact text,
  rating int check (rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now()
);
alter table public.event_vendors enable row level security;
create index event_vendors_event_idx on public.event_vendors(event_id);

create policy "Members can view vendors"
  on public.event_vendors for select to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = event_id and public.is_society_member(auth.uid(), e.society_id)
  ));
create policy "Owners/execs can write vendors"
  on public.event_vendors for all to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = event_id and public.can_manage_society(auth.uid(), e.society_id)
  ))
  with check (exists (
    select 1 from public.events e
    where e.id = event_id and public.can_manage_society(auth.uid(), e.society_id)
  ));

-- Event risks (Risk Log)
create table public.event_risks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  severity text not null default 'medium',
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.event_risks enable row level security;
create index event_risks_event_idx on public.event_risks(event_id);

create policy "Members can view risks"
  on public.event_risks for select to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = event_id and public.is_society_member(auth.uid(), e.society_id)
  ));
create policy "Owners/execs can write risks"
  on public.event_risks for all to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = event_id and public.can_manage_society(auth.uid(), e.society_id)
  ))
  with check (exists (
    select 1 from public.events e
    where e.id = event_id and public.can_manage_society(auth.uid(), e.society_id)
  ));
