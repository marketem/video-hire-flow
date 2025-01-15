import { Button } from "@/components/ui/button"
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
  hideMobileManage?: boolean
  orientation?: "horizontal" | "vertical"
}

export function JobActions({ 
  job, 
  onView, 
  onEdit, 
  onManageCandidates, 
  onJobsUpdated,
  hideMobileManage,
  orientation = "horizontal"
}: JobActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const supabase = useSupabaseClient()
  const isMobile = useIsMobile()
  const { copyToClipboard } = useCopyToClipboard()
  const { toast } = useToast()

  const handleDelete = async () => {
    const { error } = await supabase
      .from('job_openings')
      .delete()
      .eq('id', job.id)

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
      label: "View Details",
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
      destructive: true
    }
  ].filter(Boolean)

  if (isMobile && orientation === "vertical") {
    return (
      <div className="flex flex-col gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.destructive ? "destructive" : "outline"}
            className={cn(
              "w-full justify-start gap-2",
              !action.destructive && "bg-white"
            )}
            onClick={action.onClick}
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
        
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the job opening
                and remove all associated data.
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            className={cn(
              "flex items-center gap-2",
              action.destructive && "text-destructive"
            )}
          >
            <action.icon className="h-4 w-4" />
            <span>{action.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job opening
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DropdownMenu>
  )
}