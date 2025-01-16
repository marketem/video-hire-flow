import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMediaStream } from '../useMediaStream'

describe('useMediaStream', () => {
  beforeEach(() => {
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
  })

  it('should get media stream successfully', async () => {
    const { result } = renderHook(() => useMediaStream())
    
    await act(async () => {
      const stream = await result.current.getStream()
      expect(stream).toBeDefined()
    })
    
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: {
        width: 640,
        height: 480,
        facingMode: 'user'
      },
      audio: true
    })
  })

  it('should stop stream when component unmounts', () => {
    const mockTrack = { stop: vi.fn() }
    const mockStream = { getTracks: () => [mockTrack] }
    
    const { result, unmount } = renderHook(() => useMediaStream())
    
    act(() => {
      // @ts-ignore - Manually set stream for testing
      result.current.streamRef.current = mockStream
    })
    
    unmount()
    
    expect(mockTrack.stop).toHaveBeenCalled()
  })
})