-- Add video_token column to candidates table
alter table "public"."candidates" 
add column if not exists "video_token" text;

-- Create index for faster token lookups
create index if not exists candidates_video_token_idx 
on public.candidates(video_token);