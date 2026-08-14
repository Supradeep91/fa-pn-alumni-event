-- FA PN Connection Challenge — Database Schema
-- Run this in the Supabase SQL editor

-- ─── Profiles ───────────────────────────────────────────────────────────────
create table if not exists profiles (
  id        uuid references auth.users on delete cascade primary key,
  email     text not null,
  name      text not null,
  class_year text not null check (
    class_year in (
      '00','01','02','03','04','05','06','07','08','09',
      '10','11','12','13','14','15','16','17','18','19',
      '20','21','22','23','24','25','26',
      'CEO','CFO','Coach'
    )
  ),
  linkedin_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can read all profiles"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- ─── Stamps (confirmed bidirectional connections) ───────────────────────────
create table if not exists stamps (
  id        uuid default gen_random_uuid() primary key,
  user_a    uuid references profiles(id) on delete cascade not null,
  user_b    uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_a, user_b),
  check (user_a < user_b)   -- enforce canonical ordering for dedup
);

alter table stamps enable row level security;

create policy "Users can read all stamps"
  on stamps for select using (true);

create policy "Users can insert stamps involving themselves"
  on stamps for insert with check (auth.uid() = user_a or auth.uid() = user_b);

create policy "Users can update stamps involving themselves"
  on stamps for update
  using (auth.uid() = user_a or auth.uid() = user_b);

-- Enable real-time for leaderboard + passport updates
alter publication supabase_realtime add table stamps;

-- ─── Pending Stamps (awaiting mutual confirmation) ──────────────────────────
create table if not exists pending_stamps (
  id           uuid default gen_random_uuid() primary key,
  initiator_id uuid references profiles(id) on delete cascade not null,
  target_id    uuid references profiles(id) on delete cascade not null,
  status       text default 'pending' check (status in ('pending','confirmed','rejected','expired')),
  created_at   timestamptz default now(),
  expires_at   timestamptz default (now() + interval '10 minutes')
);

alter table pending_stamps enable row level security;

create policy "Users can read pending stamps involving themselves"
  on pending_stamps for select
  using (auth.uid() = initiator_id or auth.uid() = target_id);

create policy "Users can insert pending stamps as initiator"
  on pending_stamps for insert with check (auth.uid() = initiator_id);

create policy "Users can update pending stamps involving themselves"
  on pending_stamps for update
  using (auth.uid() = initiator_id or auth.uid() = target_id);

-- Enable real-time for incoming stamp notifications
alter publication supabase_realtime add table pending_stamps;

-- ─── Achievements ────────────────────────────────────────────────────────────
create table if not exists achievements (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references profiles(id) on delete cascade not null,
  key          text not null check (key in (
                 'time_traveller','leadership_unlock','perfect_stranger',
                 'future_match','full_house'
               )),
  unlocked_at  timestamptz default now(),
  unique(user_id, key)
);

alter table achievements enable row level security;

create policy "Users can read all achievements"
  on achievements for select using (true);

create policy "Users can insert their own achievements"
  on achievements for insert with check (auth.uid() = user_id);

alter publication supabase_realtime add table achievements;

-- ─── Future Match flags ───────────────────────────────────────────────────────
-- Stored separately so either party in a stamp can flag the other
create table if not exists future_matches (
  id         uuid default gen_random_uuid() primary key,
  flagger_id uuid references profiles(id) on delete cascade not null,
  flagged_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(flagger_id, flagged_id)
);

alter table future_matches enable row level security;

create policy "Users can read their own future matches"
  on future_matches for select
  using (auth.uid() = flagger_id or auth.uid() = flagged_id);

create policy "Users can insert their own future matches"
  on future_matches for insert with check (auth.uid() = flagger_id);

create policy "Users can delete their own future matches"
  on future_matches for delete using (auth.uid() = flagger_id);
