import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

interface UploadCandidatesProps {
  jobId: string
  onSuccess: () => void
}

export function UploadCandidates({ jobId, onSuccess }: UploadCandidatesProps) {
  const [isUploading, setIsUploading] = useState(false)
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const text = await file.text()
      const rows = text.split('\n').map(row => row.split(','))
      const headers = rows[0].map(header => header.trim().toLowerCase())
      const candidates = rows.slice(1).map(row => {
        const candidate: Record<string, string> = {}
        headers.forEach((header, index) => {
          candidate[header] = row[index]?.trim() || ''
        })
        return {
          job_id: jobId,
          name: candidate.name || candidate.fullname || '',
          email: candidate.email || '',
          status: 'new'
        }
      }).filter(candidate => candidate.name && candidate.email)

      const { error } = await supabase
        .from('candidates')
        .insert(candidates)

      if (error) throw error

      toast({
        title: "Success",
        description: `${candidates.length} candidates uploaded successfully`,
      })

      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] })
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload candidates",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="csv">Upload CSV File</Label>
        <Input
          id="csv"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </div>
      <div className="text-sm text-muted-foreground">
        <p>The CSV file should include the following columns:</p>
        <ul className="list-disc list-inside mt-2">
          <li>name (or fullname)</li>
          <li>email</li>
        </ul>
      </div>
      {isUploading && (
        <div className="flex items-center justify-center py-4">
          <Upload className="animate-bounce" />
          <span className="ml-2">Uploading candidates...</span>
        </div>
      )}
    </div>
  )
}