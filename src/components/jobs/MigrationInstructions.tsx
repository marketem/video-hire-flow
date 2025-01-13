import { CodeSnippet } from "@/components/ui/code-snippet"

const CREATE_JOB_OPENINGS_SQL = `-- Enable RLS
alter table job_openings enable row level security;

-- Create policies
create policy "Users can view their own job openings"
  on job_openings for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own job openings"
  on job_openings for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own job openings"
  on job_openings for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own job openings"
  on job_openings for delete
  using ( auth.uid() = user_id );`

const ADD_PUBLIC_PAGE_SQL = `-- Add public_page_enabled column
alter table job_openings 
add column if not exists public_page_enabled boolean default true;

-- Update existing policy to include new column
drop policy if exists "Users can update their own job openings" on job_openings;

create policy "Users can update their own job openings"
  on job_openings for update
  using ( auth.uid() = user_id );`

export function MigrationInstructions() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">1. Create Job Openings Migration</h3>
        <CodeSnippet code={CREATE_JOB_OPENINGS_SQL} />
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">2. Add Public Page Migration</h3>
        <CodeSnippet code={ADD_PUBLIC_PAGE_SQL} />
      </div>
    </div>
  )
}