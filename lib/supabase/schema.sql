-- Run this SQL in your Supabase SQL editor to set up the database

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text check (role in ('creator', 'brand', 'admin')) not null default 'creator',
  bio text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'creator')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Campaigns table
create table public.campaigns (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  goal text check (goal in ('brand_awareness', 'product_promotion', 'app_installs', 'sales_conversion', 'social_media_growth')),
  budget numeric,
  start_date date,
  end_date date,
  category text,
  guidelines text,
  status text check (status in ('draft', 'active', 'paused', 'completed')) default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.campaigns enable row level security;

create policy "Brands can manage their campaigns"
  on public.campaigns for all
  using (auth.uid() = brand_id);

create policy "Creators can view active campaigns"
  on public.campaigns for select
  using (status = 'active');

-- Collaborations table
create table public.collaborations (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  brand_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('invited', 'negotiating', 'agreed', 'in_progress', 'submitted', 'approved', 'published', 'completed', 'rejected')) default 'invited',
  payment_amount numeric,
  deliverables text,
  posting_timeline text,
  content_requirements text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.collaborations enable row level security;

create policy "Users can view their own collaborations"
  on public.collaborations for select
  using (auth.uid() = creator_id or auth.uid() = brand_id);

create policy "Brands can create collaborations"
  on public.collaborations for insert
  with check (auth.uid() = brand_id);

create policy "Parties can update their collaborations"
  on public.collaborations for update
  using (auth.uid() = creator_id or auth.uid() = brand_id);
