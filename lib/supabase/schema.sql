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
  goal text check (goal in ('brand_awareness', 'product_promotion', 'app_installs', 'sales_conversion', 'social_media_growth', 'subscriptions')),
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
  campaign_id uuid references public.campaigns(id) on delete cascade,
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

create policy "Creators can insert collaborations (proposals)"
  on public.collaborations for insert
  with check (auth.uid() = creator_id);

create policy "Parties can update their collaborations"
  on public.collaborations for update
  using (auth.uid() = creator_id or auth.uid() = brand_id);

-- Allow all authenticated users to view other profiles (for creator/brand discovery)
create policy "Authenticated users can view all profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- Allow unauthenticated visitors to read creator/brand profiles (for public pages)
create policy "Public can view creator profiles"
  on public.profiles for select
  using (role = 'creator');

create policy "Public can view brand profiles"
  on public.profiles for select
  using (role = 'brand');

-- Conversations table (for messaging)
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.profiles(id) on delete cascade not null,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(brand_id, creator_id)
);

alter table public.conversations enable row level security;

create policy "Participants can view their conversations"
  on public.conversations for select
  using (auth.uid() = brand_id or auth.uid() = creator_id);

create policy "Authenticated users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = brand_id or auth.uid() = creator_id);

create policy "Participants can update conversations"
  on public.conversations for update
  using (auth.uid() = brand_id or auth.uid() = creator_id);

-- Messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Conversation participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.brand_id = auth.uid() or c.creator_id = auth.uid())
    )
  );

create policy "Authenticated users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- Enable Realtime for messages and conversations
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
