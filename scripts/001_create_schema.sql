-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamp with time zone default now()
);

-- Create points_balance table
create table if not exists public.points_balance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  points integer not null default 0,
  updated_at timestamp with time zone default now()
);

-- Create daily_streaks table
create table if not exists public.daily_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  current_streak integer not null default 0,
  last_check_in date,
  created_at timestamp with time zone default now()
);

-- Create rewards table
create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  points_required integer not null,
  category text not null,
  icon text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Create user_rewards table (redemption history)
create table if not exists public.user_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_id uuid not null references public.rewards(id) on delete cascade,
  redeemed_at timestamp with time zone default now(),
  status text not null default 'pending'
);

-- Create referrals table
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_email text not null,
  referred_user_id uuid references auth.users(id) on delete cascade,
  points_awarded integer default 25,
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.points_balance enable row level security;
alter table public.daily_streaks enable row level security;
alter table public.rewards enable row level security;
alter table public.user_rewards enable row level security;
alter table public.referrals enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- RLS Policies for points_balance
create policy "Users can view their own points"
  on public.points_balance for select
  using (auth.uid() = user_id);

create policy "Users can update their own points"
  on public.points_balance for update
  using (auth.uid() = user_id);

create policy "Users can insert their own points"
  on public.points_balance for insert
  with check (auth.uid() = user_id);

-- RLS Policies for daily_streaks
create policy "Users can view their own streak"
  on public.daily_streaks for select
  using (auth.uid() = user_id);

create policy "Users can update their own streak"
  on public.daily_streaks for update
  using (auth.uid() = user_id);

create policy "Users can insert their own streak"
  on public.daily_streaks for insert
  with check (auth.uid() = user_id);

-- RLS Policies for rewards (public read)
create policy "Anyone can view active rewards"
  on public.rewards for select
  using (is_active = true);

-- RLS Policies for user_rewards
create policy "Users can view their own redemptions"
  on public.user_rewards for select
  using (auth.uid() = user_id);

create policy "Users can insert their own redemptions"
  on public.user_rewards for insert
  with check (auth.uid() = user_id);

-- RLS Policies for referrals
create policy "Users can view their referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id);

create policy "Users can insert their referrals"
  on public.referrals for insert
  with check (auth.uid() = referrer_id);

-- Create trigger function to auto-create profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  
  insert into public.points_balance (user_id, points)
  values (new.id, 0)
  on conflict (user_id) do nothing;
  
  insert into public.daily_streaks (user_id, current_streak)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Create trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
