export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  status: string
  created_at: string
  resume_url: string | null
  video_url: string | null
  video_token?: string | null
}