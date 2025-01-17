import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface JobFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  publicPageEnabled: boolean;
  setPublicPageEnabled: (value: boolean) => void;
  isJobClosed?: boolean;
}

export function JobFormFields({
  title,
  setTitle,
  department,
  setDepartment,
  location,
  setLocation,
  description,
  setDescription,
  publicPageEnabled,
  setPublicPageEnabled,
  isJobClosed = false,
}: JobFormFieldsProps) {
  console.log('JobFormFields render:', { 
    publicPageEnabled, 
    isJobClosed,
    checkboxDisabled: isJobClosed 
  });
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Senior Software Engineer"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="e.g. Engineering"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Remote, San Francisco, etc."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Job Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter the job description..."
          className="h-32"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="publicPageEnabled"
          checked={publicPageEnabled}
          onCheckedChange={(checked) => {
            console.log('Checkbox clicked:', { checked });
            setPublicPageEnabled(checked as boolean);
          }}
          disabled={isJobClosed}
        />
        <Label 
          htmlFor="publicPageEnabled" 
          className={`font-normal ${isJobClosed ? 'text-gray-400' : ''}`}
        >
          Enable public job post page {isJobClosed && "(disabled for closed jobs)"}
        </Label>
      </div>
    </div>
  );
}