interface CandidatesEmptyProps {
  jobTitle?: string
}

export function CandidatesEmpty({ jobTitle }: CandidatesEmptyProps) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">
        {jobTitle 
          ? `No candidates yet for ${jobTitle}`
          : "No candidates yet"}
      </p>
    </div>
  )
}