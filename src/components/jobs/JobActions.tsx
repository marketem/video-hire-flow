import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Pencil, ExternalLink, Copy, Trash } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import type { JobOpening } from "./types"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { useToast } from "@/hooks/use-toast"

interface JobActionsProps {
  job: JobOpening
  onView: (job: JobOpening) => void
  onEdit: (job: JobOpening) => void
  onManageCandidates: (job: JobOpening) => void
  onJobsUpdated: () => void
  orientation?: "horizontal" | "vertical"
  hideMobileManage?: boolean
}

export function JobActions({
  job,
  onView,
  onEdit,
  onManageCandidates,
  onJobsUpdated,
  orientation = "horizontal",
  hideMobileManage = false,
}: JobActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const supabase = useSupabaseClient()
  const isMobile = useIsMobile()
  const { copyToClipboard } = useCopyToClipboard()
  const { toast } = useToast()

  const handleDelete = async () => {
    const { error } = await supabase
      .from("job_openings")
      .delete()
      .eq("id", job.id)

    if (!error) {
      onJobsUpdated()
    }
  }

  const handleCopyPost = async () => {
    const postUrl = `${window.location.origin}/jobs/${job.id}`
    const success = await copyToClipboard(postUrl)
    
    if (success) {
      toast({
        title: "Link copied",
        description: "Job post link has been copied to clipboard",
      })
    }
  }

  const actions = [
    {
      label: "View Job",
      icon: Eye,
      onClick: () => onView(job)
    },
    {
      label: "Edit Job",
      icon: Pencil,
      onClick: () => onEdit(job)
    },
    !hideMobileManage && {
      label: "Visit Post",
      icon: ExternalLink,
      onClick: () => onManageCandidates(job)
    },
    {
      label: "Copy Post",
      icon: Copy,
      onClick: handleCopyPost
    },
    {
      label: "Delete Job",
      icon: Trash,
      onClick: () => setShowDeleteConfirm(true),
      className: "text-destructive"
    }
  ].filter(Boolean)

  if (isMobile && orientation === "vertical") {
    return (
      <div className="space-y-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className={cn("w-full justify-start", action.className)}
            onClick={action.onClick}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        ))}
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
      </div>
    )
  }

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