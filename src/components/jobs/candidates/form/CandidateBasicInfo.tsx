import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CandidateBasicInfoProps {
  name: string
  email: string
  phone: string
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
}

export function CandidateBasicInfo({
  name,
  email,
  phone,
  onNameChange,
  onEmailChange,
  onPhoneChange,
}: CandidateBasicInfoProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          required
          placeholder="+1 (234) 567-8900"
        />
        <p className="text-xs text-muted-foreground">
          Enter phone number in any format - we'll format it automatically
        </p>
      </div>
    </>
  )
}