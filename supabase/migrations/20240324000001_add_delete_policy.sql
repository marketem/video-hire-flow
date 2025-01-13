-- Drop existing delete policy if it exists
drop policy if exists "Enable delete for job owners" on "public"."candidates";

-- Create delete policy for job owners
create policy "Enable delete for job owners"
on "public"."candidates"
for delete
to authenticated
using (
    exists (
        select 1 from job_openings
        where job_openings.id = candidates.job_id
        and job_openings.user_id = auth.uid()
    )
);