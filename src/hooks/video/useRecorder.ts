import { useRef, useState } from "react"

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const getSupportedMimeType = () => {
    // Test a wider range of MIME types in order of preference
    const types = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4',
    ]
    
    // Log all supported types for debugging
    console.log("Testing MIME type support...")
    types.forEach(type => {
      console.log(`${type}: ${MediaRecorder.isTypeSupported(type)}`)
    })
    
    const supportedType = types.find(type => MediaRecorder.isTypeSupported(type))
    if (supportedType) {
      console.log("Selected MIME type:", supportedType)
      return supportedType
    }
    
    // If no preferred types are supported, try to get the browser's default
    if (MediaRecorder.isTypeSupported('video/webm')) {
      console.log("Falling back to basic video/webm")
      return 'video/webm'
    }
    
    throw new Error("No supported video recording format found in this browser")
  }

  const startRecording = (stream: MediaStream) => {
    try {
      const mimeType = getSupportedMimeType()
      console.log("Creating MediaRecorder with MIME type:", mimeType)
      
      const options: MediaRecorderOptions = {
        mimeType,
        videoBitsPerSecond: 1000000, // 1 Mbps
        audioBitsPerSecond: 128000   // 128 kbps
      }

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          console.log("Received data chunk of size:", e.data.size)
          chunksRef.current.push(e.data)
        }
      }

      // Request data more frequently for better handling
      mediaRecorder.start(1000)
      setIsRecording(true)
      console.log("Recording started successfully")
    } catch (error) {
      console.error("Failed to start recording:", error)
      throw error
    }
  }

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        console.warn("No active recording to stop")
        resolve(new Blob())
        return
      }

      mediaRecorderRef.current.onstop = () => {
        try {
          const mimeType = mediaRecorderRef.current?.mimeType || 'video/webm'
          console.log("Creating final blob with MIME type:", mimeType)
          const blob = new Blob(chunksRef.current, { type: mimeType })
          console.log("Final blob size:", blob.size, "bytes")
          resolve(blob)
        } catch (error) {
          console.error("Error creating final blob:", error)
          resolve(new Blob())
        }
      }

      mediaRecorderRef.current.stop()
      setIsRecording(false)
      console.log("Recording stopped")
    })
  }

  return {
    isRecording,
    startRecording,
    stopRecording,
  }
}