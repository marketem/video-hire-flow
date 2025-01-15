import { useState, useEffect } from "react"
import { useMediaStream } from "./video/useMediaStream"
import { useRecorder } from "./video/useRecorder"
import { useVideoPlayback } from "./video/useVideoPlayback"

export function useVideoRecording() {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const { getStream, stopStream } = useMediaStream()
  const { isRecording, startRecording, stopRecording } = useRecorder()
  const { 
    videoRef, 
    isPlaying, 
    resetVideoElement, 
    setupVideoPreview: setupVideoPreviewFromPlayback,
    setupVideoPlayback,
    togglePlayback 
  } = useVideoPlayback()

  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleStopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isRecording])

  const handleStartRecording = async () => {
    try {
      resetVideoElement()
      const stream = await getStream()
      await setupVideoPreviewFromPlayback(stream)
      startRecording(stream)
      setTimeLeft(30)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const handleStopRecording = async () => {
    const blob = await stopRecording()
    stopStream()
    setRecordedBlob(blob)
    setupVideoPlayback(blob)
  }

  const resetRecording = () => {
    resetVideoElement()
    setRecordedBlob(null)
  }

  const setupVideoPreview = async () => {
    try {
      const stream = await getStream()
      await setupVideoPreviewFromPlayback(stream)
    } catch (error) {
      console.error('Failed to setup video preview:', error)
      throw error
    }
  }

  return {
    isRecording,
    recordedBlob,
    isPlaying,
    timeLeft,
    videoRef,
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
    togglePlayback,
    resetRecording,
    resetVideoElement,
    setupVideoPreview
  }
}