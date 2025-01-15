export interface VideoStats {
  jobId: string
  jobTitle: string
  videosReceived: number
  readyForReview: number
  awaitingResponse: number
  approvedCount: number
  rejectedCount: number
  oldestPending?: Date
  totalInvitesSent: number
}