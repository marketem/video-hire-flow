import { useState, useEffect } from "react"
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
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Update form when candidate changes
  useEffect(() => {
    if (candidate) {
      setName(candidate.name)
      setEmail(candidate.email)
      setPhone(candidate.phone)
      setPhoneError("")
    }
  }, [candidate])

  const validatePhoneNumber = (phone: string) => {
    // Remove all whitespace
    const cleaned = phone.trim()
    
    // Check if starts with +
    if (!cleaned.startsWith('+')) {
      return { isValid: false, error: "Phone number must start with +" }
    }

    // Check if there's at least one digit after the +
    if (cleaned.length < 2) {
      return { isValid: false, error: "Country code is required" }
    }

    // Check if all remaining characters are digits
    const digits = cleaned.slice(1)
    if (!/^\d+$/.test(digits)) {
      return { isValid: false, error: "Phone number can only contain digits after the +" }
    }

    // Ensure minimum length for international number (+ plus at least 7 digits)
    if (cleaned.length < 8) {
      return { isValid: false, error: "Phone number is too short" }
    }

    return { isValid: true, error: "" }
  }

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    const validation = validatePhoneNumber(value)
    setPhoneError(validation.error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!candidate) return

    // Validate phone number before submission
    const phoneValidation = validatePhoneNumber(phone)
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error)
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('candidates')
        .update({
          name,
          email,
          phone,
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
              onChange={(e) => handlePhoneChange(e.target.value)}
              required
              placeholder="+1 (234) 567-8900"
              className={phoneError ? "border-red-500" : ""}
            />
            {phoneError && (
              <p className="text-sm text-red-500 mt-1">
                {phoneError}
              </p>
            )}
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
            <Button type="submit" disabled={isSubmitting || !!phoneError}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}