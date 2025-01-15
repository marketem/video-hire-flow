import { ErrorBoundary } from "@/components/ErrorBoundary"
import { VideoPreview } from "./VideoPreview"
import { RecordingTimer } from "./RecordingTimer"
import { RecordingControls } from "./RecordingControls"
import { useVideoRecording } from "@/hooks/video/useVideoRecording"

export function VideoRecordingSection() {
  const {
    videoRef,
    recordedBlob,
    isRecording,
    isPlaying,
    timeLeft,
    isUploading,
    startRecording,
    stopRecording,
    togglePlayback,
    handleUpload,
    resetRecording,
  } = useVideoRecording()

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <VideoPreview
          videoRef={videoRef}
          recordedBlob={recordedBlob}
          isPlaying={isPlaying}
          isRecording={isRecording}
          togglePlayback={togglePlayback}
        />
        
        {isRecording && <RecordingTimer timeLeft={timeLeft} />}
        
        <RecordingControls
          isRecording={isRecording}
          recordedBlob={recordedBlob}
          isUploading={isUploading}
          startRecording={startRecording}
          stopRecording={stopRecording}
          handleUpload={handleUpload}
          resetRecording={resetRecording}
        />
      </div>
    </ErrorBoundary>
  )
}