-- Create candidates table
create table "public"."candidates" (
    id uuid default gen_random_uuid() primary key,
    job_id uuid references public.job_openings(id) on delete cascade not null,
    name text not null,
    email text not null,
    phone text not null,
    resume_url text,
    status text default 'new' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on candidates table
alter table "public"."candidates" enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow public to insert candidates" on "public"."candidates";
drop policy if exists "Allow users to view candidates for their jobs" on "public"."candidates";
drop policy if exists "Allow users to update candidates for their jobs" on "public"."candidates";

-- Allow anyone to insert new candidates (for job applications)
create policy "Allow public to insert candidates"
    on "public"."candidates"
    for insert
    to public
    with check (true);

-- Allow authenticated users to view candidates for their jobs
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

-- Allow authenticated users to update candidates for their jobs
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