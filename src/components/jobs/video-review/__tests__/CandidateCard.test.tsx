import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CandidateCard } from '../CandidateCard'
import type { Candidate } from '@/types/candidate'

// Mock hooks
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('CandidateCard', () => {
  const mockCandidate: Candidate = {
    id: '1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '1234567890',
    job_id: 'job-1',
    status: 'reviewing',
    created_at: new Date().toISOString(),
    video_url: 'video.mp4',
  }

  const mockHandlers = {
    onVideoReview: vi.fn().mockResolvedValue('video-url'),
    onStatusChange: vi.fn(),
  }

  it('renders candidate information correctly', () => {
    render(
      <CandidateCard
        candidate={mockCandidate}
        onVideoReview={mockHandlers.onVideoReview}
      />
    )

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('handles video review button click', async () => {
    const user = userEvent.setup()
    
    render(
      <CandidateCard
        candidate={mockCandidate}
        onVideoReview={mockHandlers.onVideoReview}
      />
    )

    const reviewButton = screen.getByText(/Review Video/i)
    await user.click(reviewButton)

    expect(mockHandlers.onVideoReview).toHaveBeenCalledWith(
      mockCandidate.video_url,
      mockCandidate.name
    )
  })

  it('shows approval/rejection buttons when showActions is true', () => {
    render(
      <CandidateCard
        candidate={mockCandidate}
        showActions={true}
        onVideoReview={mockHandlers.onVideoReview}
        onStatusChange={mockHandlers.onStatusChange}
      />
    )

    const approveButton = screen.getByRole('button', { name: /thumbs up/i })
    const rejectButton = screen.getByRole('button', { name: /thumbs down/i })

    expect(approveButton).toBeInTheDocument()
    expect(rejectButton).toBeInTheDocument()
  })
})