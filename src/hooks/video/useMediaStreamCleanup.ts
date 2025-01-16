import { useEffect, useRef } from "react"

export function useMediaStreamCleanup() {
  const streamRef = useRef<MediaStream | null>(null)

  const setStream = (stream: MediaStream | null) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    streamRef.current = stream
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return { setStream }
}