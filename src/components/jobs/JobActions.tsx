import type { JobOpening } from "./types"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileJobActions } from "./MobileJobActions"
import { DesktopJobActions } from "./DesktopJobActions"

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
  onJobsUpdated,
  orientation = "horizontal",
  hideMobileManage = false,
}: JobActionsProps) {
  const isMobile = useIsMobile()

  if (isMobile && orientation === "vertical") {
    return (
      <MobileJobActions
        job={job}
        onView={onView}
        onEdit={onEdit}
        onJobsUpdated={onJobsUpdated}
        hideMobileManage={hideMobileManage}
      />
    )
  }

  return (
    <DesktopJobActions
      job={job}
      onView={onView}
      onEdit={onEdit}
      onJobsUpdated={onJobsUpdated}
    />
  )
}