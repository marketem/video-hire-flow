-- Enable the HTTP extension if not already enabled
create extension if not exists "http" with schema "extensions";

-- Drop the function if it exists (useful for updates)
drop function if exists "public"."send_video_invite";

-- Create the Edge Function
create or replace function public.send_video_invite(payload json)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  response json;
begin
  select
    content::json
  from
    http((
      'POST',
      current_setting('app.settings.edge_function_url') || '/send-video-invite',
      ARRAY[http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))],
      'application/json',
      payload::text
    )::http_request)
  into response;

  return response;
end;
$$;

-- Set up RLS policy for the function
do $$
begin
  execute format(
    'grant execute on function public.send_video_invite(json) to authenticated;'
  );
end $$;

-- Add comment explaining the function
comment on function public.send_video_invite is 'Sends a video interview invitation email using the Supabase invite user template';