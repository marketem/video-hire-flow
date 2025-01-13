import { useEffect, useRef, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { Video, StopCircle, Play } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useQuery } from "@tanstack/react-query"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function VideoSubmission() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout>()
  const streamRef = useRef<MediaStream | null>(null)
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  // Fetch candidate data using the token
  const { data: candidate, isLoading: isLoadingCandidate } = useQuery({
    queryKey: ['candidate', token],
    queryFn: async () => {
      if (!token) throw new Error('No token provided')
      
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('video_token', token)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!token,
    retry: false,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Invalid or expired video submission link",
          variant: "destructive",
        })
        navigate('/')
      }
    }
  })

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  // Reset video element when switching between recording and playback
  const resetVideoElement = () => {
    if (videoRef.current) {
      console.log('Resetting video element:', {
        currentTime: videoRef.current.currentTime,
        duration: videoRef.current.duration,
        readyState: videoRef.current.readyState,
        paused: videoRef.current.paused,
        muted: videoRef.current.muted,
        error: videoRef.current.error
      })
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      videoRef.current.srcObject = null
      videoRef.current.src = ""
      videoRef.current.load()
    }
  }

  // Handle recorded blob changes
  useEffect(() => {
    if (recordedBlob && videoRef.current) {
      console.log('Setting up recorded blob playback:', {
        blobSize: recordedBlob.size,
        blobType: recordedBlob.type,
        videoElement: {
          readyState: videoRef.current.readyState,
          error: videoRef.current.error
        }
      })
      
      resetVideoElement()
      
      const videoURL = URL.createObjectURL(recordedBlob)
      console.log('Created video URL:', videoURL)
      
      videoRef.current.src = videoURL
      videoRef.current.muted = false
      videoRef.current.load()
      
      return () => {
        URL.revokeObjectURL(videoURL)
      }
    }
  }, [recordedBlob])

  const compressVideo = async (blob: Blob): Promise<Blob> => {
    if (blob.size <= MAX_FILE_SIZE) {
      return blob;
    }

    // Create a lower quality MediaRecorder
    const mediaStream = new MediaStream([
      new MediaStreamTrack()
    ]);

    return new Promise((resolve, reject) => {
      try {
        const compressedChunks: Blob[] = [];
        const mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/webm;codecs=vp8',
          videoBitsPerSecond: 1000000 // 1 Mbps
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            compressedChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const compressedBlob = new Blob(compressedChunks, { type: 'video/webm' });
          resolve(compressedBlob);
        };

        mediaRecorder.onerror = (event) => {
          reject(new Error('Media recording error: ' + event.error));
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 100);
      } catch (error) {
        console.error('Compression error:', error);
        // If compression fails, return original blob but chunked into smaller pieces
        resolve(blob);
      }
    });
  };

  const handleUpload = async () => {
    if (!recordedBlob || !candidate?.id) return;
    setUploadError(null)
    setIsUploading(true)

    try {
      // Check file size before attempting upload
      if (recordedBlob.size > MAX_FILE_SIZE) {
        throw new Error(`Video size (${Math.round(recordedBlob.size / (1024 * 1024))}MB) exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit. Please record a shorter video.`);
      }

      const fileName = `${candidate.id}-${Date.now()}.webm`;
      const file = new File([recordedBlob], fileName, {
        type: 'video/webm'
      });

      console.log('Preparing to upload file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // First check if bucket exists and is accessible
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('videos');

      if (bucketError) {
        console.error('Bucket access error:', bucketError);
        throw new Error('Unable to access storage bucket');
      }

      console.log('Bucket access confirmed:', bucketData);

      // Proceed with upload
      const { data, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', data);

      // Update candidate record
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ 
          video_url: fileName,
          video_token: null
        })
        .eq('id', candidate.id);

      if (updateError) {
        console.error('Candidate update error:', updateError);
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Your video has been uploaded successfully!",
      });

      navigate('/submission-success');
    } catch (error) {
      console.error('Upload process error:', error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed. Please try again.";
      setUploadError(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  const startRecording = async () => {
    try {
      console.log('Starting recording...')
      resetVideoElement()
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: true 
      })
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        await videoRef.current.play()
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        
        setRecordedBlob(blob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setTimeLeft(30)
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast({
        title: "Error",
        description: "Could not access camera. Please ensure you've granted permission.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    console.log('Stopping recording...')
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const togglePlayback = () => {
    if (videoRef.current) {
      console.log('Toggling playback:', {
        currentTime: videoRef.current.currentTime,
        duration: videoRef.current.duration,
        readyState: videoRef.current.readyState,
        paused: videoRef.current.paused,
        muted: videoRef.current.muted,
        error: videoRef.current.error
      })
      
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(err => {
          console.error('Error during playback:', err)
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  if (isLoadingCandidate) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Record Your Introduction</h1>
        <p className="text-muted-foreground text-center mb-8">
          Please record a 30-second video introducing yourself
        </p>

        {uploadError && (
          <Alert variant="destructive">
            <AlertTitle>Upload Error</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {isRecording && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Time remaining:</span>
              <span className="text-sm font-medium">{timeLeft}s</span>
            </div>
            <Progress value={((30 - timeLeft) / 30) * 100} />
          </div>
        )}

        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            className="w-full h-full object-cover"
            onEnded={() => setIsPlaying(false)}
          />
          {recordedBlob && !isPlaying && !isRecording && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
              onClick={togglePlayback}
            >
              <Play className="w-16 h-16 text-white" />
            </div>
          )}
        </div>

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
              <Button onClick={() => {
                resetVideoElement()
                setRecordedBlob(null)
              }} variant="outline" className="flex-1">
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
      </div>
    </div>
  )
}
