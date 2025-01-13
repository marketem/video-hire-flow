import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Video, 
  Users, 
  ClipboardList,
  Send,
  Upload,
  ListFilter,
  ThumbsUp,
  Building2,
  Mail
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Video Interview Platform",
    description: "Streamline your hiring process with asynchronous video interviews. Candidates can record and submit responses on their own time, making the screening process more efficient."
  },
  {
    icon: Users,
    title: "Candidate Management",
    description: "Organize all your candidates in one place with our intuitive dashboard. Track application status, review submissions, and manage the entire hiring pipeline efficiently."
  },
  {
    icon: ClipboardList,
    title: "Job Posting Management",
    description: "Create and manage detailed job postings with custom descriptions, requirements, and qualifications. Track applications and responses for each position."
  },
  {
    icon: Send,
    title: "Automated Video Invites",
    description: "Send automated video interview invitations to candidates with just a click. Candidates receive personalized links to submit their video responses."
  },
  {
    icon: Upload,
    title: "Bulk Candidate Import",
    description: "Save time by importing multiple candidates at once using CSV files. Easily upload candidate information including names, emails, and phone numbers."
  },
  {
    icon: ListFilter,
    title: "Candidate Filtering",
    description: "Filter and sort candidates based on status, response completion, and review stage. Quickly identify candidates ready for review or awaiting response."
  },
  {
    icon: ThumbsUp,
    title: "Video Review System",
    description: "Review candidate video submissions with an intuitive interface. Approve or reject candidates, and collaborate with your team on hiring decisions."
  },
  {
    icon: Building2,
    title: "Company Dashboard",
    description: "Get insights into your hiring process with real-time metrics. Track response rates, review progress, and monitor candidate engagement across all positions."
  },
  {
    icon: Mail,
    title: "Email Notifications",
    description: "Keep candidates informed throughout the process with automated email notifications. Send reminders and updates about their application status."
  }
];

const Features = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold mb-4">
              Modern Video Hiring Platform
            </h1>
            <p className="text-xl text-muted-foreground">
              Streamline your hiring process with our comprehensive video interview and candidate management system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Icon className="h-8 w-8 mb-4 text-primary" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Features;