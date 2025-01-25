import { useRef, useState } from "react"

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const getSupportedMimeType = () => {
    const types = [
      'video/mp4',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=h264,opus',
      'video/webm'
    ]
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`Using supported MIME type: ${type}`)
        return type
      }
    }
    console.error('No supported video MIME type found')
    return 'video/mp4' // Fallback
  }

  const startRecording = (stream: MediaStream) => {
    const mimeType = getSupportedMimeType()
    console.log("Creating MediaRecorder with MIME type:", mimeType)
    
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 1000000, // 1Mbps
        audioBitsPerSecond: 128000   // 128Kbps
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          console.log(`Received data chunk of size: ${e.data.size}`)
          chunksRef.current.push(e.data)
        }
      }

      // Request data more frequently for better handling
      mediaRecorder.start(1000)
      setIsRecording(true)
      console.log("Recording started successfully")
    } catch (error) {
      console.error("Error starting recording:", error)
      throw error
    }
  }

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        console.log("No active recording to stop")
        resolve(new Blob())
        return
      }

      mediaRecorderRef.current.onstop = () => {
        console.log("Recording stopped")
        const mimeType = mediaRecorderRef.current?.mimeType || 'video/mp4'
        console.log(`Creating final blob with MIME type: ${mimeType}`)
        const blob = new Blob(chunksRef.current, { type: mimeType })
        console.log(`Final blob size: ${blob.size} bytes`)
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