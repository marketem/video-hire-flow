-- Add video_url column to candidates table
alter table "public"."candidates" 
add column if not exists "video_url" text;

-- Create videos bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Create storage policies for videos bucket
create policy "Allow authenticated uploads to videos bucket"
on storage.objects for insert
to authenticated
with check (bucket_id = 'videos');

create policy "Allow authenticated downloads from videos bucket"
on storage.objects for select
to authenticated
using (bucket_id = 'videos');