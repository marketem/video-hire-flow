import { Button } from "@/components/ui/button"
import { Video, StopCircle } from "lucide-react"

interface RecordingControlsProps {
  isRecording: boolean
  recordedBlob: Blob | null
  isUploading: boolean
  startRecording: () => Promise<void>
  stopRecording: () => void
  handleUpload: () => Promise<void>
  resetRecording: () => void
}

export function RecordingControls({
  isRecording,
  recordedBlob,
  isUploading,
  startRecording,
  stopRecording,
  handleUpload,
  resetRecording
}: RecordingControlsProps) {
  return (
    <div className="flex justify-center gap-4">
      {!isRecording && !recordedBlob && (
        <Button onClick={startRecording} className="w-full">
          <Video className="mr-2 h-4 w-4" />
          Start Recording
        </Button>
      )}
      
      {isRecording && (
        <Button onClick={stopRecording} variant="destructive" className="w-full">
          <StopCircle className="mr-2 h-4 w-4" />
          Stop Recording
        </Button>
      )}

      {recordedBlob && !isUploading && (
        <div className="flex w-full gap-2">
          <Button onClick={resetRecording} variant="outline" className="flex-1">
            Record Again
          </Button>
          <Button onClick={handleUpload} className="flex-1">
            Upload Video
          </Button>
        </div>
      )}

      {isUploading && (
        <Button disabled className="w-full">
          Uploading...
        </Button>
      )}
    </div>
  )
}