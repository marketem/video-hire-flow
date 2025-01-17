import { useRef, useState } from "react"

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4'
    ]
    
    return types.find(type => MediaRecorder.isTypeSupported(type)) || ''
  }

  const startRecording = (stream: MediaStream) => {
    const mimeType = getSupportedMimeType()
    if (!mimeType) {
      throw new Error("No supported video MIME type found in this browser")
    }
    
    console.log("Creating MediaRecorder with MIME type:", mimeType)
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      // Add video bitrate (1Mbps)
      videoBitsPerSecond: 1000000,
      // Add audio bitrate (64Kbps)
      audioBitsPerSecond: 64000
    })
    mediaRecorderRef.current = mediaRecorder
    chunksRef.current = []

    mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    // Request data more frequently to handle smaller chunks
    mediaRecorder.start(1000) // Collect data every second instead of waiting until stop
    setIsRecording(true)
  }

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        resolve(new Blob())
        return
      }

      mediaRecorderRef.current.onstop = () => {
        const mimeType = getSupportedMimeType()
        const blob = new Blob(chunksRef.current, { type: mimeType })
        resolve(blob)
      }

      mediaRecorderRef.current.stop()
      setIsRecording(false)
    })
  }

  return {
    isRecording,
    startRecording,
    stopRecording,
  }
}