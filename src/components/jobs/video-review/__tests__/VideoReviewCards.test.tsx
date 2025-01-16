import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VideoReviewCards } from '../VideoReviewCards'
import { useVideoStats } from '../useVideoStats'

// Mock the hooks
vi.mock('../useVideoStats')

describe('VideoReviewCards', () => {
  const mockVideoStats = [
    {
      jobId: '1',
      jobTitle: 'Software Engineer',
      readyForReview: 2,
      awaitingResponse: 1,
      approvedCount: 3,
      rejectedCount: 1,
      oldestPending: new Date().toISOString(),
    }
  ]

  beforeEach(() => {
    vi.mocked(useVideoStats).mockReturnValue({
      data: mockVideoStats,
      isLoading: false,
      error: null,
    })
  })

  it('renders video stats correctly', () => {
    render(<VideoReviewCards />)
    
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('(2)')).toBeInTheDocument()
    expect(screen.getByText('Ready for Review')).toBeInTheDocument()
  })

  it('shows empty state when no stats available', () => {
    vi.mocked(useVideoStats).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    render(<VideoReviewCards />)
    expect(screen.getByText(/No video submissions or pending requests yet/i)).toBeInTheDocument()
  })
})