import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"

export function useJobForm(onSuccess?: () => void) {
  const [title, setTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("job_openings").insert([
        {
          title,
          department,
          location,
          description,
        },
      ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Job opening created successfully",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job opening",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    title,
    setTitle,
    department,
    setDepartment,
    location,
    setLocation,
    description,
    setDescription,
    isLoading,
    handleSubmit,
  }
}