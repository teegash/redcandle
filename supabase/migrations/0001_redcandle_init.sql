create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'member');
create type public.asset_class as enum ('forex', 'crypto', 'indices', 'commodities');
create type public.direction as enum ('long', 'short');
create type public.entry_type as enum ('market', 'pending');
create type public.signal_status as enum ('pending', 'open', 'closed', 'cancelled');
create type public.signal_result as enum ('open', 'tp_hit', 'sl_hit', 'untriggered');
create type public.health_state as enum ('healthy', 'degraded', 'offline');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'member',
  display_name text not null,
  email text unique,
  telegram_username text,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null,
  active boolean not null default false,
  valid_until timestamptz,
  payment_provider text not null default 'paystack',
  payment_reference text,
  provider_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists subscriptions_user_unique_idx on public.subscriptions(user_id);

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  symbol text not null,
  asset_class public.asset_class not null,
  direction public.direction not null,
  entry_type public.entry_type not null,
  timeframe text not null,
  entry_price numeric not null,
  take_profit numeric not null,
  stop_loss numeric not null,
  status public.signal_status not null default 'pending',
  result public.signal_result not null default 'open',
  realized_pips numeric,
  risk_reward_ratio numeric not null,
  notes text not null default '',
  opened_at timestamptz,
  closed_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.executions (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  result public.signal_result not null,
  realized_pips numeric,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.metrics_daily (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  trades_count integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  win_rate numeric not null default 0,
  expectancy_pips numeric not null default 0,
  profit_factor numeric not null default 0,
  max_drawdown numeric not null default 0,
  sharpe numeric not null default 0,
  sortino numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.app_health_logs (
  id uuid primary key default gen_random_uuid(),
  checked_at timestamptz not null default now(),
  vercel_status public.health_state not null,
  supabase_status public.health_state not null,
  telegram_status public.health_state not null,
  billing_status public.health_state not null,
  api_latency_ms integer not null,
  error_rate numeric not null default 0
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  action text not null,
  status text not null default 'success',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists signals_status_created_idx on public.signals(status, created_at desc);
create index if not exists signals_symbol_asset_idx on public.signals(symbol, asset_class);
create index if not exists executions_signal_idx on public.executions(signal_id);
create index if not exists subscriptions_user_idx on public.subscriptions(user_id, active);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.signals enable row level security;
alter table public.executions enable row level security;
alter table public.metrics_daily enable row level security;
alter table public.app_health_logs enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_active_subscription()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.subscriptions
    where user_id = auth.uid()
      and active = true
      and (valid_until is null or valid_until > now())
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Member'),
    new.email,
    'member'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create policy "members can read signals"
  on public.signals
  for select
  to authenticated
  using (public.is_admin() or public.has_active_subscription());

create policy "admins manage signals"
  on public.signals
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "members read executions"
  on public.executions
  for select
  to authenticated
  using (public.is_admin() or public.has_active_subscription());

create policy "admins manage executions"
  on public.executions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "users read own subscription"
  on public.subscriptions
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "admins manage subscriptions"
  on public.subscriptions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "users read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "users update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "members read metrics"
  on public.metrics_daily
  for select
  to authenticated
  using (public.is_admin() or public.has_active_subscription());

create policy "admins manage metrics"
  on public.metrics_daily
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins view health"
  on public.app_health_logs
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins view audits"
  on public.audit_logs
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
