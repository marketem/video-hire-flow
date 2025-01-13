-- First create the videos bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow public uploads to videos bucket" on storage.objects;
drop policy if exists "Allow public reads from videos bucket" on storage.objects;

-- Create a policy that allows public uploads to videos bucket
create policy "Allow public uploads to videos bucket"
on storage.objects for insert
with check (bucket_id = 'videos');

-- Create a policy that allows public reads from videos bucket
create policy "Allow public reads from videos bucket"
on storage.objects for select
using (bucket_id = 'videos');