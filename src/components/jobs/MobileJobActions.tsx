import { Button } from "@/components/ui/button"
import { Eye, Pencil, ExternalLink, Copy, Trash, XCircle } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { useJobActionHandlers } from "./utils/jobActionUtils"

interface MobileJobActionsProps {
  job: JobOpening
  onView: (job: JobOpening) => void
  onEdit: (job: JobOpening) => void
  onJobsUpdated: () => void
  hideMobileManage?: boolean
}

export function MobileJobActions({
  job,
  onView,
  onEdit,
  onJobsUpdated,
  hideMobileManage = false,
}: MobileJobActionsProps) {
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
    !hideMobileManage && {
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
      <div className="space-y-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className={cn(
              "w-full justify-start border border-gray-200",
              action.className
            )}
            onClick={action.onClick}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>

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