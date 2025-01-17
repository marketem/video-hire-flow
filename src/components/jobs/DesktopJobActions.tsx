import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Pencil, ExternalLink, Copy, Trash, XCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import type { JobOpening } from "./types"
import { useJobActionHandlers } from "./utils/jobActionUtils"

interface DesktopJobActionsProps {
  job: JobOpening
  onView: (job: JobOpening) => void
  onEdit: (job: JobOpening) => void
  onJobsUpdated: () => void
}

export function DesktopJobActions({
  job,
  onView,
  onEdit,
  onJobsUpdated,
}: DesktopJobActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { handleDelete, handleVisitPost, handleCopyPost, handleCloseJob } = useJobActionHandlers(job, onJobsUpdated)

  const actions = [
    {
      label: "Job Details",
      icon: Eye,
      onClick: () => onView(job)
    },
    {
      label: "Edit Job",
      icon: Pencil,
      onClick: () => onEdit(job)
    },
    {
      label: "Visit Job Post",
      icon: ExternalLink,
      onClick: handleVisitPost
    },
    {
      label: "Copy Post URL",
      icon: Copy,
      onClick: handleCopyPost
    },
    job.status === 'open' && {
      label: "Close Job",
      icon: XCircle,
      onClick: handleCloseJob
    },
    {
      label: "Delete Job",
      icon: Trash,
      onClick: () => setShowDeleteConfirm(true),
      className: "text-destructive"
    }
  ].filter(Boolean)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={action.onClick}
              className={action.className}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this job opening and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}