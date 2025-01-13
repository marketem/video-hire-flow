import { useState } from "react"

export function useCandidateSelection() {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])

  const toggleSelectAll = (candidates: { id: string }[], checked: boolean) => {
    if (checked) {
      setSelectedCandidates(candidates.map(c => c.id))
    } else {
      setSelectedCandidates([])
    }
  }

  const toggleCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates(prev => [...prev, candidateId])
    } else {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId))
    }
  }

  return {
    selectedCandidates,
    setSelectedCandidates,
    toggleSelectAll,
    toggleCandidate
  }
}