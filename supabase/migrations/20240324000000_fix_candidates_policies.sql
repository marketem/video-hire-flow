-- Drop existing policies
drop policy if exists "Allow public to insert candidates" on "public"."candidates";
drop policy if exists "Allow users to view candidates for their jobs" on "public"."candidates";
drop policy if exists "Allow users to update candidates for their jobs" on "public"."candidates";

-- Re-create policies with correct permissions
create policy "Allow public to insert candidates"
    on "public"."candidates"
    for insert
    to public
    with check (true);

create policy "Allow users to view candidates for their jobs"
    on "public"."candidates"
    for select
    to authenticated
    using (
        exists (
            select 1 
            from job_openings 
            where job_openings.id = candidates.job_id
            and job_openings.user_id = auth.uid()
        )
    );

create policy "Allow users to update candidates for their jobs"
    on "public"."candidates"
    for update
    to authenticated
    using (
        exists (
            select 1 
            from job_openings 
            where job_openings.id = candidates.job_id
            and job_openings.user_id = auth.uid()
        )
    )
    with check (true);

-- Add an index to improve query performance
create index if not exists candidates_job_id_idx on candidates(job_id);