import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, MessageSquare } from "lucide-react"

export function UploadCandidates({ jobId, onSuccess }: { jobId: string; onSuccess: () => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const checkDuplicateEmails = async (emails: string[]) => {
    const { data: existingCandidates, error } = await supabase
      .from('candidates')
      .select('email')
      .eq('job_id', jobId)
      .in('email', emails)

    if (error) {
      console.error('Error checking for duplicate emails:', error)
      return []
    }

    return existingCandidates?.map(c => c.email) || []
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters except +
    const cleaned = phone.replace(/[^\d+]/g, '')
    
    // If it already starts with +, return as is
    if (cleaned.startsWith('+')) {
      return cleaned
    }
    
    // If it starts with 1, add +
    if (cleaned.startsWith('1')) {
      return `+${cleaned}`
    }
    
    // Otherwise, add +1
    return `+1${cleaned}`
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const text = await file.text()
      const rows = text.split('\n').map(row => row.split(','))
      const headers = rows[0].map(header => header.trim().toLowerCase())
      
      // Extract all emails from the CSV
      const emails = rows.slice(1).map(row => {
        const emailIndex = headers.indexOf('email')
        return row[emailIndex]?.trim() || ''
      }).filter(Boolean)

      // Check for duplicates
      const duplicateEmails = await checkDuplicateEmails(emails)
      if (duplicateEmails.length > 0) {
        toast({
          title: "Duplicate Emails Found",
          description: `The following emails already exist: ${duplicateEmails.join(', ')}`,
          variant: "destructive",
        })
        setIsUploading(false)
        return
      }

      const candidates = rows.slice(1).map(row => {
        const candidate: Record<string, string> = {}
        headers.forEach((header, index) => {
          candidate[header] = row[index]?.trim() || ''
        })
        
        const phone = candidate.phone || candidate.phonenumber || ''
        const formattedPhone = formatPhoneNumber(phone)
        
        return {
          job_id: jobId,
          name: candidate.name || candidate.fullname || '',
          email: candidate.email || '',
          phone: formattedPhone,
          status: 'new'
        }
      }).filter(candidate => candidate.name && candidate.email && candidate.phone)

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
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: "Failed to upload candidates",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Prevent default behavior for the entire drop zone area
  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefaults(e)
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefaults(e)
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefaults(e)
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  return (
    <div 
      className="space-y-6"
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="text-sm text-muted-foreground space-y-4">
          <h3 className="font-medium text-foreground">CSV File Requirements:</h3>
          <div className="space-y-2">
            <p>Your CSV file should include these columns:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><code className="bg-muted px-1 rounded">name</code> or <code className="bg-muted px-1 rounded">fullname</code> - The candidate's full name</li>
              <li><code className="bg-muted px-1 rounded">email</code> - The candidate's email address</li>
              <li><code className="bg-muted px-1 rounded">phone</code> or <code className="bg-muted px-1 rounded">phonenumber</code> - The candidate's phone number</li>
            </ul>
            <p className="text-xs">Example: name,email,phone<br />John Doe,john@example.com,1234567890</p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-4 bg-yellow-50/50 border border-yellow-200 rounded-lg">
        <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5 text-yellow-600" />
        <p className="text-sm text-yellow-800">
          By uploading candidate information, you confirm that you have obtained proper consent to contact these individuals via SMS. Each candidate may receive updates about their application via SMS.
        </p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="csv" className="text-base">Upload Candidates CSV</Label>
        <div className="flex items-center justify-center w-full">
          <label 
            htmlFor="csv" 
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragging 
                ? "border-primary bg-primary/5" 
                : "bg-muted/5 hover:bg-muted/10 border-muted-foreground/20"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground/75">CSV files only</p>
            </div>
            <Input
              id="csv"
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
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