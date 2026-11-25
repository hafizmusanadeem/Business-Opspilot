-- Work records for the public intake, client portal and operator dashboard.
-- Every table carries organization_id and is protected by RLS.
--
-- Role model (memberships.role):
--   owner, operator -> staff: see everything in their organization
--   viewer          -> client: sees only client-facing records

-- Role check used by every policy below. SECURITY DEFINER so it can read
-- memberships without recursing into that table's own RLS policies.
create or replace function public.has_org_role(org_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.organization_id = org_id
      and m.user_id = (select auth.uid())
      and m.role = any (allowed_roles)
  );
$$;

revoke execute on function public.has_org_role(uuid, text[]) from public, anon;
grant execute on function public.has_org_role(uuid, text[]) to authenticated;

-- Sales leads. Staff only: qualification notes must never reach clients.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations on delete cascade,
  contact_name text not null,
  email text not null,
  company text,
  message text,
  qualification_notes text,
  status text not null default 'new' check (status in ('new', 'qualified', 'won', 'lost')),
  created_at timestamptz not null default now()
);

-- Support requests. Clients see their own; staff see the whole organization.
create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations on delete cascade,
  requester_id uuid references auth.users on delete set null,
  subject text not null,
  body text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'complete')),
  created_at timestamptz not null default now()
);

-- Messages carry an explicit visibility so internal chatter stays internal.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations on delete cascade,
  sender_id uuid references auth.users on delete set null,
  body text not null,
  visibility text not null default 'client' check (visibility in ('client', 'internal')),
  created_at timestamptz not null default now()
);

-- Human approvals requested by agents/workflows. Staff only.
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations on delete cascade,
  title text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- Automation executions. Staff only.
create table public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations on delete cascade,
  workflow_name text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed')),
  error_message text,
  started_at timestamptz not null default now()
);

create index leads_org_status_idx on public.leads (organization_id, status, created_at);
create index support_requests_org_status_idx on public.support_requests (organization_id, status, created_at);
create index support_requests_requester_idx on public.support_requests (requester_id);
create index meetings_org_starts_idx on public.meetings (organization_id, starts_at);
create index projects_org_status_idx on public.projects (organization_id, status);
create index messages_org_created_idx on public.messages (organization_id, created_at desc);
create index approvals_org_status_idx on public.approvals (organization_id, status, created_at);
create index workflow_runs_org_status_idx on public.workflow_runs (organization_id, status, started_at desc);

alter table public.leads enable row level security;
alter table public.support_requests enable row level security;
alter table public.meetings enable row level security;
alter table public.projects enable row level security;
alter table public.messages enable row level security;
alter table public.approvals enable row level security;
alter table public.workflow_runs enable row level security;

-- Read-only for now. Write policies arrive with the workflows that need them.
grant select on public.leads, public.support_requests, public.meetings,
  public.projects, public.messages, public.approvals, public.workflow_runs
  to authenticated;

create policy "Staff can read leads"
on public.leads for select to authenticated
using (public.has_org_role(organization_id, array['owner', 'operator']));

create policy "Staff read all requests, clients read their own"
on public.support_requests for select to authenticated
using (
  public.has_org_role(organization_id, array['owner', 'operator'])
  or (
    requester_id = (select auth.uid())
    and public.has_org_role(organization_id, array['owner', 'operator', 'viewer'])
  )
);

create policy "Members can read meetings"
on public.meetings for select to authenticated
using (public.has_org_role(organization_id, array['owner', 'operator', 'viewer']));

create policy "Members can read projects"
on public.projects for select to authenticated
using (public.has_org_role(organization_id, array['owner', 'operator', 'viewer']));

create policy "Staff read all messages, clients read client-visible ones"
on public.messages for select to authenticated
using (
  public.has_org_role(organization_id, array['owner', 'operator'])
  or (
    visibility = 'client'
    and public.has_org_role(organization_id, array['owner', 'operator', 'viewer'])
  )
);

create policy "Staff can read approvals"
on public.approvals for select to authenticated
using (public.has_org_role(organization_id, array['owner', 'operator']));

create policy "Staff can read workflow runs"
on public.workflow_runs for select to authenticated
using (public.has_org_role(organization_id, array['owner', 'operator']));
