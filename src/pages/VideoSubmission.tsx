import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useVideoSubmission } from "@/contexts/VideoSubmissionContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { VideoErrorBoundary } from "@/components/video-submission/VideoErrorBoundary";
import { VideoPreview } from "@/components/video-submission/VideoPreview";
import { RecordingTimer } from "@/components/video-submission/RecordingTimer";
import { RecordingControls } from "@/components/video-submission/RecordingControls";
import { useMediaStream } from "@/hooks/video/useMediaStream";
import { useRecorder } from "@/hooks/video/useRecorder";
import { useMediaStreamCleanup } from "@/hooks/video/useMediaStreamCleanup";

export default function VideoSubmission() {
  const { stream, recordedVideo, isRecording, startRecording, stopRecording, retakeVideo, handleSubmitVideo, isSubmitting, recordingStartTime, error } = useVideoSubmission();

  return (
    <div className="h-screen bg-background p-2 flex flex-col">
      <div className="mb-1">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/658547e3-9dac-4df0-84d6-a891876840a9.png" 
            alt="VibeCheck Logo" 
            className="h-8 w-8"
          />
          <span className="text-xl font-bold">VibeCheck</span>
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center -mt-12">
        <div className="w-full max-w-md space-y-2">
          <h1 className="text-2xl font-bold text-center">Record Your Introduction</h1>
          <p className="text-muted-foreground text-center mb-1">
            Please record a 30-second video introducing yourself
          </p>

          <VideoErrorBoundary>
            <div className="relative">
              <VideoPreview
                stream={stream}
                recordedVideo={recordedVideo}
                isRecording={isRecording}
              />
              {isRecording && (
                <div className="absolute top-2 right-2">
                  <RecordingTimer startTime={recordingStartTime} />
                </div>
              )}
            </div>

            <RecordingControls
              isRecording={isRecording}
              hasRecordedVideo={!!recordedVideo}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onRetakeVideo={retakeVideo}
              onSubmitVideo={handleSubmitVideo}
              isSubmitting={isSubmitting}
              stream={stream}
            />
          </VideoErrorBoundary>

          {error && (
            <div className="text-destructive text-center text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
