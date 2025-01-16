import { Button } from "@/components/ui/button"
import { Video, StopCircle } from "lucide-react"

interface RecordingControlsProps {
  isRecording: boolean
  recordedBlob: Blob | null
  isUploading: boolean
  cameraInitialized: boolean
  startRecording: () => Promise<void>
  stopRecording: () => void
  handleUpload: () => Promise<void>
  resetRecording: () => void
  onStartCamera: () => Promise<void>
}

export function RecordingControls({
  isRecording,
  recordedBlob,
  isUploading,
  cameraInitialized,
  startRecording,
  stopRecording,
  handleUpload,
  resetRecording,
  onStartCamera
}: RecordingControlsProps) {
  const handleReset = () => {
    resetRecording()
    // This will trigger the initial camera setup flow again
    onStartCamera()
  }

  return (
    <div className="flex justify-center gap-4">
      {!cameraInitialized && !recordedBlob && (
        <Button onClick={onStartCamera} className="w-full">
          <Video className="mr-2 h-4 w-4" />
          Start Camera
        </Button>
      )}
      
      {cameraInitialized && !isRecording && !recordedBlob && (
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
          <Button onClick={handleReset} variant="outline" className="flex-1">
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