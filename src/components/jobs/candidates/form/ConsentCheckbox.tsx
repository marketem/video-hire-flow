import { Checkbox } from "@/components/ui/checkbox"

interface ConsentCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function ConsentCheckbox({ checked, onCheckedChange }: ConsentCheckboxProps) {
  return (
    <div className="flex items-start space-x-2 border rounded-lg p-4 bg-muted/5">
      <Checkbox 
        id="consent" 
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
        className="mt-1"
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="consent"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Consent Confirmation
        </label>
        <p className="text-sm text-muted-foreground">
          I confirm that the candidate has consented to receive SMS communications and agreed to VibeCheck's Terms of Service and Privacy Policy. Message and data rates may apply.
        </p>
      </div>
    </div>
  )
}