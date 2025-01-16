import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VideoReviewCards } from '../VideoReviewCards'
import { useVideoStats } from '../useVideoStats'
import type { VideoStats } from '../types'

// Mock the hooks
vi.mock('../useVideoStats')

describe('VideoReviewCards', () => {
  const mockVideoStats: VideoStats[] = [
    {
      jobId: '1',
      jobTitle: 'Software Engineer',
      videosReceived: 2,
      readyForReview: 2,
      awaitingResponse: 1,
      approvedCount: 3,
      rejectedCount: 1,
      oldestPending: new Date(),
      totalInvitesSent: 5
    }
  ]

  beforeEach(() => {
    vi.mocked(useVideoStats).mockReturnValue({
      data: mockVideoStats,
      isLoading: false,
      error: null,
      isSuccess: true,
      isFetching: false,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isStale: false,
      isPlaceholderData: false,
      status: 'success',
      fetchStatus: 'idle',
      refetch: vi.fn(),
      remove: vi.fn()
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
      isSuccess: true,
      isFetching: false,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isStale: false,
      isPlaceholderData: false,
      status: 'success',
      fetchStatus: 'idle',
      refetch: vi.fn(),
      remove: vi.fn()
    })

    render(<VideoReviewCards />)
    expect(screen.getByText(/No video submissions or pending requests yet/i)).toBeInTheDocument()
  })
})