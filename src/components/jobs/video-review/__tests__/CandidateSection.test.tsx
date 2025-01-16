import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CandidateSection } from '../CandidateSection'
import type { Candidate } from '@/types/candidate'

describe('CandidateSection', () => {
  const mockCandidates: Candidate[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      job_id: 'job-1',
      status: 'reviewing',
      created_at: new Date().toISOString(),
      video_url: 'video.mp4',
    }
  ]

  const mockHandlers = {
    onVideoReview: vi.fn().mockResolvedValue('video-url'),
    onStatusChange: vi.fn(),
  }

  it('renders candidates correctly', () => {
    render(
      <CandidateSection
        title="Test Section"
        candidates={mockCandidates}
        onVideoReview={mockHandlers.onVideoReview}
      />
    )

    expect(screen.getByText('Test Section')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows empty state when no candidates', () => {
    render(
      <CandidateSection
        title="Empty Section"
        candidates={[]}
        onVideoReview={mockHandlers.onVideoReview}
      />
    )

    expect(screen.getByText(/No candidates in this category/i)).toBeInTheDocument()
  })
})