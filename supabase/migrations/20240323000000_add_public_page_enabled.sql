alter table "public"."job_openings" 
add column "public_page_enabled" boolean not null default true;

-- Update the existing update policy to explicitly include public_page_enabled
drop policy if exists "Allow users to update their own job openings" on "public"."job_openings";

create policy "Allow users to update their own job openings"
    on "public"."job_openings"
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);