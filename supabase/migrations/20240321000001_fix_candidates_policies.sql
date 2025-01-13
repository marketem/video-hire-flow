-- First disable RLS to make changes
alter table "public"."candidates" disable row level security;

-- Re-enable RLS with correct policies
alter table "public"."candidates" enable row level security;

-- Allow anyone to insert new candidates (for job applications)
create policy "Enable insert access for all users"
    on "public"."candidates"
    for insert
    to public
    with check (true);

-- Allow job owners to view their candidates
create policy "Enable read access for job owners"
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

-- Allow job owners to update their candidates
create policy "Enable update access for job owners"
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