alter table "public"."job_openings" 
add column if not exists "video_instructions" text;

-- Add default value to existing rows
update "public"."job_openings"
set "video_instructions" = 'We''re so excited to meet you! Please record a 30-second video introducing yourself.'
where "video_instructions" is null;