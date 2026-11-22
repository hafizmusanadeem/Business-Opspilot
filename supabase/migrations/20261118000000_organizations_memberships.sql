-- Store each tenant that uses OpsPilot.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Connect authenticated users to one tenant and role.
create table public.memberships (
  organization_id uuid references public.organizations on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text not null check (role in ('owner', 'operator', 'viewer')),
  primary key (organization_id, user_id)
);

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;

-- Users can see their own membership rows. The organizations policy below
-- queries memberships, and that subquery is itself subject to RLS, so without
-- this policy the organization policy would never match any row.
create policy "Users can read their own memberships"
on public.memberships for select to authenticated
using (user_id = (select auth.uid()));

create policy "Members can read their organization"
on public.organizations for select to authenticated
using (exists (
  select 1 from public.memberships
  where memberships.organization_id = organizations.id
    and memberships.user_id = (select auth.uid())
));