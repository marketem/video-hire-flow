-- First disable RLS to make changes
alter table "public"."candidates" disable row level security;

-- Drop existing policies if they exist
drop policy if exists "Enable insert access for all users" on "public"."candidates";
drop policy if exists "Enable read access for job owners" on "public"."candidates";
drop policy if exists "Enable update access for job owners" on "public"."candidates";

-- Enable storage access for resumes bucket
insert into storage.buckets (id, name, public) 
values ('resumes', 'resumes', true)
on conflict (id) do update set public = true;

-- Create storage policy to allow uploads
create policy "Allow public uploads"
on storage.objects for insert
to public
with check (bucket_id = 'resumes');

-- Re-enable RLS with correct policies
alter table "public"."candidates" enable row level security;

-- Allow anyone to insert candidates
create policy "Enable insert access for all users"
on "public"."candidates"
for insert
to public
with check (true);

-- Allow job owners to read candidates
create policy "Enable read access for job owners"
on "public"."candidates"
for select
to authenticated
using (
    exists (
        select 1 from job_openings
        where job_openings.id = candidates.job_id
        and job_openings.user_id = auth.uid()
    )
);

-- Allow job owners to update candidates
create policy "Enable update access for job owners"
on "public"."candidates"
for update
to authenticated
using (
    exists (
        select 1 from job_openings
        where job_openings.id = candidates.job_id
        and job_openings.user_id = auth.uid()
    )
)
with check (true);

-- Verify policies are created
select * from pg_policies where tablename = 'candidates';