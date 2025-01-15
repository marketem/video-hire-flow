import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Candidate } from "@/types/candidate"

interface EditCandidateSheetProps {
  candidate: Candidate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
}

export function EditCandidateSheet({ candidate, open, onOpenChange, jobId }: EditCandidateSheetProps) {
  const [name, setName] = useState(candidate?.name || "")
  const [email, setEmail] = useState(candidate?.email || "")
  const [phone, setPhone] = useState(candidate?.phone || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Reset form when candidate changes
  useState(() => {
    if (candidate) {
      setName(candidate.name)
      setEmail(candidate.email)
      setPhone(candidate.phone)
    }
  }, [candidate])

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('1')) {
      return `+${cleaned}`
    }
    return `+1${cleaned}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!candidate) return

    setIsSubmitting(true)

    try {
      const formattedPhone = formatPhoneNumber(phone)
      
      const { error } = await supabase
        .from('candidates')
        .update({
          name,
          email,
          phone: formattedPhone,
        })
        .eq('id', candidate.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['job-candidates', jobId] })

      toast({
        title: "Success",
        description: "Candidate details updated successfully",
      })

      onOpenChange(false)
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update candidate",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Candidate</SheetTitle>
          <SheetDescription>
            Update candidate details
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+1 (234) 567-8900"
            />
            <p className="text-xs text-muted-foreground">
              Enter phone number with country code (e.g., +1 for US numbers)
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}