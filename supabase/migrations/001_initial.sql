-- Parse results
create table if not exists public.parse_results (
  id             uuid        default gen_random_uuid() primary key,
  user_id        uuid        references auth.users(id) on delete cascade not null,
  file_name      text        not null,
  parsed_at      timestamptz default now() not null,
  data           jsonb       not null
);

-- Subscriptions
create table if not exists public.subscriptions (
  id                     uuid        default gen_random_uuid() primary key,
  user_id                uuid        references auth.users(id) on delete cascade not null unique,
  stripe_customer_id     text        unique,
  stripe_subscription_id text        unique,
  plan_id                text,       -- 'starter' | 'pro'
  price_id               text,
  status                 text        not null default 'inactive',
  current_period_end     timestamptz,
  created_at             timestamptz default now() not null
);

-- Indexes
create index if not exists parse_results_user_id_idx   on public.parse_results(user_id);
create index if not exists parse_results_parsed_at_idx on public.parse_results(parsed_at desc);
create index if not exists subs_customer_idx            on public.subscriptions(stripe_customer_id);

-- Row Level Security
alter table public.parse_results  enable row level security;
alter table public.subscriptions  enable row level security;

create policy "own_parse_results_select"
  on public.parse_results for select using (auth.uid() = user_id);

create policy "own_parse_results_insert"
  on public.parse_results for insert with check (auth.uid() = user_id);

create policy "own_subscription_select"
  on public.subscriptions for select using (auth.uid() = user_id);
