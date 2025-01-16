import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VideoSubmissionProvider } from '@/contexts/VideoSubmissionContext'
import VideoSubmission from '@/pages/VideoSubmission'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

// Mock Supabase client
vi.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: vi.fn(),
}))

// Mock React Router hooks
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams({ token: 'test-token' }), vi.fn()],
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}))

// Mock the useQuery hook
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({
    data: {
      id: 'test-id',
      name: 'Test Candidate',
      email: 'test@example.com',
    },
    isLoading: false,
  }),
}))

describe('VideoSubmission Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    
    // Mock navigator.mediaDevices
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{
            stop: vi.fn()
          }]
        })
      },
      writable: true
    })

    // Mock Supabase client implementation
    ;(useSupabaseClient as any).mockReturnValue({
      storage: {
        from: () => ({
          upload: vi.fn().mockResolvedValue({ data: { path: 'test.webm' }, error: null }),
        }),
      },
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockResolvedValue({ error: null }),
      }),
    })
  })

  it('renders the video submission form', () => {
    render(
      <VideoSubmissionProvider>
        <VideoSubmission />
      </VideoSubmissionProvider>
    )
    
    expect(screen.getByText(/Record Your Introduction/i)).toBeInTheDocument()
  })

  it('handles camera initialization', async () => {
    render(
      <VideoSubmissionProvider>
        <VideoSubmission />
      </VideoSubmissionProvider>
    )
    
    const startButton = screen.getByText(/Start Camera/i)
    await userEvent.click(startButton)
    
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled()
  })

  it('handles recording flow', async () => {
    render(
      <VideoSubmissionProvider>
        <VideoSubmission />
      </VideoSubmissionProvider>
    )
    
    // Start camera
    const startCameraButton = screen.getByText(/Start Camera/i)
    await userEvent.click(startCameraButton)
    
    // Start recording
    const startRecordingButton = await screen.findByText(/Start Recording/i)
    await userEvent.click(startRecordingButton)
    
    // Should show stop recording button
    expect(screen.getByText(/Stop Recording/i)).toBeInTheDocument()
  })
})