import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-4">
            <h3 className="font-medium text-foreground">CSV File Requirements:</h3>
            <div className="space-y-2">
              <p>Your CSV file should include these columns:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="bg-muted px-1 rounded">name</code> or <code className="bg-muted px-1 rounded">fullname</code> - The candidate's full name</li>
                <li><code className="bg-muted px-1 rounded">email</code> - The candidate's email address</li>
              </ul>
              <p className="text-xs">Example: name,email<br />John Doe,john@example.com</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Label htmlFor="csv" className="text-base">Upload Candidates CSV</Label>
        <div className="flex items-center justify-center w-full">
          <label htmlFor="csv" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/5 hover:bg-muted/10 border-muted-foreground/20">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground/75">CSV files only</p>
            </div>
            <Input
              id="csv"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {isUploading && (
        <div className="flex items-center justify-center py-4">
          <Upload className="animate-bounce mr-2" />
          <span>Uploading candidates...</span>
        </div>
      )}
    </div>
  )
}