import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

interface ResumeUploadProps {
  resume: File | null
  onResumeChange: (file: File | null) => void
}

export function ResumeUpload({ resume, onResumeChange }: ResumeUploadProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="resume">Resume</Label>
      <div className="flex items-center justify-center w-full">
        <label htmlFor="resume" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/5 hover:bg-muted/10 border-muted-foreground/20">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground/75">PDF, DOC, or DOCX (Max 10MB)</p>
          </div>
          <Input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => onResumeChange(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
      </div>
      {resume && (
        <p className="text-sm text-muted-foreground mt-2">
          Selected file: {resume.name}
        </p>
      )}
    </div>
  )
}