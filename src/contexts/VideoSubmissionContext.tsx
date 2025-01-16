import React, { createContext, useContext, useReducer, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

type VideoState = {
  isRecording: boolean
  recordedBlob: Blob | null
  isPlaying: boolean
  timeLeft: number
  cameraInitialized: boolean
  isUploading: boolean
  error: string | null
}

type VideoAction =
  | { type: "START_RECORDING" }
  | { type: "STOP_RECORDING"; payload: Blob }
  | { type: "TOGGLE_PLAYBACK" }
  | { type: "UPDATE_TIME"; payload: number }
  | { type: "INITIALIZE_CAMERA" }
  | { type: "START_UPLOAD" }
  | { type: "FINISH_UPLOAD" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "RESET" }

const initialState: VideoState = {
  isRecording: false,
  recordedBlob: null,
  isPlaying: false,
  timeLeft: 30,
  cameraInitialized: false,
  isUploading: false,
  error: null,
}

function videoReducer(state: VideoState, action: VideoAction): VideoState {
  switch (action.type) {
    case "START_RECORDING":
      return {
        ...state,
        isRecording: true,
        timeLeft: 30,
        error: null,
      }
    case "STOP_RECORDING":
      return {
        ...state,
        isRecording: false,
        recordedBlob: action.payload,
      }
    case "TOGGLE_PLAYBACK":
      return {
        ...state,
        isPlaying: !state.isPlaying,
      }
    case "UPDATE_TIME":
      return {
        ...state,
        timeLeft: action.payload,
      }
    case "INITIALIZE_CAMERA":
      return {
        ...state,
        cameraInitialized: true,
        error: null,
      }
    case "START_UPLOAD":
      return {
        ...state,
        isUploading: true,
        error: null,
      }
    case "FINISH_UPLOAD":
      return {
        ...state,
        isUploading: false,
      }
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      }
    case "RESET":
      return initialState
    default:
      return state
  }
}

type VideoSubmissionContextType = {
  state: VideoState
  startRecording: () => void
  stopRecording: (blob: Blob) => void
  togglePlayback: () => void
  updateTime: (time: number) => void
  initializeCamera: () => void
  startUpload: () => void
  finishUpload: () => void
  setError: (error: string) => void
  reset: () => void
}

const VideoSubmissionContext = createContext<VideoSubmissionContextType | undefined>(
  undefined
)

export function VideoSubmissionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(videoReducer, initialState)
  const { toast } = useToast()

  const startRecording = () => {
    dispatch({ type: "START_RECORDING" })
  }

  const stopRecording = (blob: Blob) => {
    dispatch({ type: "STOP_RECORDING", payload: blob })
  }

  const togglePlayback = () => {
    dispatch({ type: "TOGGLE_PLAYBACK" })
  }

  const updateTime = (time: number) => {
    dispatch({ type: "UPDATE_TIME", payload: time })
  }

  const initializeCamera = () => {
    dispatch({ type: "INITIALIZE_CAMERA" })
  }

  const startUpload = () => {
    dispatch({ type: "START_UPLOAD" })
  }

  const finishUpload = () => {
    dispatch({ type: "FINISH_UPLOAD" })
  }

  const setError = (error: string) => {
    dispatch({ type: "SET_ERROR", payload: error })
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    })
  }

  const reset = () => {
    dispatch({ type: "RESET" })
  }

  return (
    <VideoSubmissionContext.Provider
      value={{
        state,
        startRecording,
        stopRecording,
        togglePlayback,
        updateTime,
        initializeCamera,
        startUpload,
        finishUpload,
        setError,
        reset,
      }}
    >
      {children}
    </VideoSubmissionContext.Provider>
  )
}

export function useVideoSubmission() {
  const context = useContext(VideoSubmissionContext)
  if (context === undefined) {
    throw new Error("useVideoSubmission must be used within a VideoSubmissionProvider")
  }
  return context
}