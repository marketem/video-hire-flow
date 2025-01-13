-- First create the videos bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow authenticated uploads to videos bucket" on storage.objects;
drop policy if exists "Allow authenticated reads from videos bucket" on storage.objects;
drop policy if exists "Allow public uploads to videos bucket" on storage.objects;

-- Create policies for video uploads and access
create policy "Allow public uploads to videos bucket"
on storage.objects for insert
with check (bucket_id = 'videos');

create policy "Allow public reads from videos bucket"
on storage.objects for select
using (bucket_id = 'videos');

-- Set file size limit for the videos bucket
update storage.buckets
set file_size_limit = 10485760  -- 10MB in bytes
where id = 'videos';