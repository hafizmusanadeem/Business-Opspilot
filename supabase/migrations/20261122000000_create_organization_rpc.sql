-- Create an organization and assign its creator the owner role.
-- Both inserts execute within the same database transaction.

create or replace function public.create_organization_for_current_user(
  p_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_organization_id uuid;
  v_name text;
begin
  -- Never trust a user ID supplied by the client.
  v_user_id := (select auth.uid());

  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  -- Validate and normalize the organization name.
  v_name := btrim(coalesce(p_name, ''));

  if v_name = '' or char_length(v_name) > 100 then
    raise exception 'Organization name must contain 1 to 100 characters'
      using errcode = '22023';
  end if;

  -- Create the organization.
  insert into public.organizations (name)
  values (v_name)
  returning id into v_organization_id;

  -- The authenticated user automatically becomes its owner.
  insert into public.memberships (
    organization_id,
    user_id,
    role
  )
  values (
    v_organization_id,
    v_user_id,
    'owner'
  );

  return v_organization_id;
end;
$$;

-- Remove default execution permissions.
revoke all on function public.create_organization_for_current_user(text)
from public;

revoke all on function public.create_organization_for_current_user(text)
from anon;

-- Only authenticated users may execute this function.
grant execute on function public.create_organization_for_current_user(text)
to authenticated;
