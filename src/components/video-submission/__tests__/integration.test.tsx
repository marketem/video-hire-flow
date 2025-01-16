import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VideoSubmissionProvider } from '@/contexts/VideoSubmissionContext'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import VideoSubmission from '@/pages/VideoSubmission'

// Mock necessary dependencies
vi.mock('@supabase/auth-helpers-react')
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams({ token: 'test-token' }), vi.fn()],
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}))

describe('Video Submission Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock MediaRecorder
    const MediaRecorderMock = vi.fn(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      ondataavailable: vi.fn(),
      state: 'inactive',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    // Add isTypeSupported as a static method
    MediaRecorderMock.isTypeSupported = vi.fn().mockReturnValue(true)
    window.MediaRecorder = MediaRecorderMock as unknown as typeof MediaRecorder

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

    // Mock Supabase client
    vi.mocked(useSupabaseClient).mockReturnValue({
      storage: {
        from: () => ({
          upload: vi.fn().mockResolvedValue({ data: { path: 'test.webm' }, error: null }),
        }),
      },
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as any)
  })

  it('completes full video submission flow', async () => {
    const user = userEvent.setup()
    
    render(
      <VideoSubmissionProvider>
        <VideoSubmission />
      </VideoSubmissionProvider>
    )

    // 1. Start camera
    const startCameraButton = screen.getByText(/Start Camera/i)
    await user.click(startCameraButton)
    
    // 2. Start recording
    const startRecordingButton = await screen.findByText(/Start Recording/i)
    await user.click(startRecordingButton)
    
    // 3. Stop recording
    const stopRecordingButton = await screen.findByText(/Stop Recording/i)
    await user.click(stopRecordingButton)
    
    // 4. Upload video
    const uploadButton = await screen.findByText(/Upload Video/i)
    await user.click(uploadButton)
    
    // Verify upload was attempted
    await waitFor(() => {
      expect(useSupabaseClient().storage.from().upload).toHaveBeenCalled()
    })
  })

  it('handles errors gracefully', async () => {
    // Mock failed media stream
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new Error('Camera access denied'))
      },
      writable: true
    })

    const user = userEvent.setup()
    
    render(
      <VideoSubmissionProvider>
        <VideoSubmission />
      </VideoSubmissionProvider>
    )

    const startCameraButton = screen.getByText(/Start Camera/i)
    await user.click(startCameraButton)
    
    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/Camera Error/i)).toBeInTheDocument()
    })
  })
})