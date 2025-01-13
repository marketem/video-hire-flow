create table "public"."job_openings" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    "title" text not null,
    "department" text not null,
    "location" text not null,
    "description" text not null,
    "status" text not null default 'open',
    "public_page_enabled" boolean default true,
    "user_id" uuid references auth.users(id),
    constraint job_openings_pkey primary key (id)
);

-- Set up Row Level Security (RLS)
alter table "public"."job_openings" enable row level security;

-- Create policy to allow authenticated users to view all job openings
create policy "Allow users to view all job openings"
    on "public"."job_openings"
    for select
    to authenticated
    using (true);

-- Create policy to allow users to create their own job openings
create policy "Allow users to create their own job openings"
    on "public"."job_openings"
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Create policy to allow users to update their own job openings
create policy "Allow users to update their own job openings"
    on "public"."job_openings"
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Create policy to allow public access to enabled job openings
create policy "Allow public access to enabled job openings"
    on "public"."job_openings"
    for select
    to public
    using (public_page_enabled = true and status = 'open');