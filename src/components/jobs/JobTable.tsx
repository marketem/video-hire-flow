import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobActions } from "./JobActions";
import type { JobOpening } from "./types";

interface JobTableProps {
  jobs: JobOpening[];
  onManageCandidates: (job: JobOpening) => void;
  onViewJob: (job: JobOpening) => void;
  onEditJob: (job: JobOpening) => void;
  onJobsUpdated: () => void;
}

export function JobTable({ 
  jobs, 
  onManageCandidates, 
  onViewJob, 
  onEditJob, 
  onJobsUpdated 
}: JobTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Candidates</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium">{job.title}</TableCell>
            <TableCell>{job.location}</TableCell>
            <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
            <TableCell>{job.candidates_count}</TableCell>
            <TableCell>
              <span 
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  job.status === 'open' 
                    ? 'ring-green-600/20 bg-green-50 text-green-700'
                    : 'ring-red-600/20 bg-red-50 text-red-700'
                }`}
              >
                {job.status}
              </span>
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => onManageCandidates(job)}
              >
                <Users className="h-4 w-4 mr-2" />
                Invites
              </Button>
              <JobActions
                job={job}
                onView={onViewJob}
                onEdit={onEditJob}
                onManageCandidates={onManageCandidates}
                onJobsUpdated={onJobsUpdated}
                hideMobileManage
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}