interface CandidateStatusBadgeProps {
  status: string
}

export function CandidateStatusBadge({ status }: CandidateStatusBadgeProps) {
  return (
    <span 
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
        status === 'new' 
          ? 'ring-gray-600/20 bg-gray-50 text-gray-700'
          : status === 'requested'
          ? 'ring-blue-600/20 bg-blue-50 text-blue-700'
          : status === 'reviewing'
          ? 'ring-yellow-600/20 bg-yellow-50 text-yellow-700'
          : status === 'approved'
          ? 'ring-green-600/20 bg-green-50 text-green-700'
          : 'ring-red-600/20 bg-red-50 text-red-700'
      }`}
    >
      {status}
    </span>
  )
}