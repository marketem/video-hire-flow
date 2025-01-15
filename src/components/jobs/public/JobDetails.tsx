import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { JobOpening } from "@/components/jobs/types"
import { JobApplicationForm } from "./JobApplicationForm"

interface JobDetailsProps {
  job: JobOpening
}

export function JobDetails({ job }: JobDetailsProps) {
  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>{job.title}</CardTitle>
        <CardDescription>
          {job.department} · {job.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none mb-8">
          <h3 className="text-lg font-semibold mb-2">About this role</h3>
          <div className="whitespace-pre-wrap">{job.description}</div>
        </div>
        <JobApplicationForm jobId={job.id} />
      </CardContent>
    </Card>
  )
}