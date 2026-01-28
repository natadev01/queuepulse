create extension if not exists pgcrypto;

create sequence if not exists queue_ticket_code_seq start 1;

create table if not exists operator_allowlist (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists queue_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_code text unique not null,
  user_id uuid null references auth.users(id) on delete set null,
  status text not null default 'WAITING' check (status in ('WAITING','SERVING','DONE')),
  created_at timestamptz not null default now(),
  serving_at timestamptz null,
  done_at timestamptz null,
  served_by uuid null references auth.users(id) on delete set null
);

create index if not exists queue_tickets_status_created_at_idx
  on queue_tickets(status, created_at);

create or replace function next_ticket_code()
returns text
language plpgsql
as $$
declare
  next_val bigint;
begin
  next_val := nextval('queue_ticket_code_seq');
  return 'Q-' || lpad(next_val::text, 3, '0');
end;
$$;

create or replace function create_queue_ticket(p_user_id uuid default null)
returns queue_tickets
language plpgsql
as $$
declare
  new_ticket queue_tickets;
  daily_limit int := 3;
  today_count int := 0;
begin
  if p_user_id is null then
    raise exception 'User is required to create a ticket.';
  end if;

  select count(*)
  into today_count
  from queue_tickets
  where user_id = p_user_id
    and created_at >= date_trunc('day', now());

  if today_count >= daily_limit then
    raise exception 'Daily ticket limit reached (%).', daily_limit;
  end if;

  insert into queue_tickets(ticket_code, user_id)
  values (next_ticket_code(), p_user_id)
  returning * into new_ticket;
  return new_ticket;
end;
$$;

alter table queue_tickets enable row level security;

create policy "Authenticated read" on queue_tickets
  for select
  to authenticated
  using (true);

create policy "Authenticated insert" on queue_tickets
  for insert
  to authenticated
  with check (true);

create policy "Operator update" on queue_tickets
  for update
  to authenticated
  using (
    exists (
      select 1
      from operator_allowlist
      where email = auth.jwt()->>'email'
    )
  );
