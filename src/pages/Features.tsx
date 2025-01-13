import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Video, 
  Users, 
  MessageSquare, 
  Bell, 
  UserPlus, 
  FileSpreadsheet,
  Shield,
  Clock,
  Building2
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Asynchronous Video Interviews",
    description: "Screen candidates efficiently with pre-recorded video submissions, allowing flexible scheduling for both recruiters and candidates."
  },
  {
    icon: Users,
    title: "Candidate Management",
    description: "Track and manage all your candidates in one place with our intuitive dashboard interface."
  },
  {
    icon: MessageSquare,
    title: "Video Response Review",
    description: "Review and evaluate candidate video submissions with your team, making collaborative hiring decisions easier."
  },
  {
    icon: Bell,
    title: "SMS Notifications",
    description: "Automated SMS notifications to keep candidates informed and engaged throughout the hiring process."
  },
  {
    icon: UserPlus,
    title: "Unlimited Job Postings",
    description: "Create and manage multiple job openings with custom descriptions and requirements."
  },
  {
    icon: FileSpreadsheet,
    title: "Bulk Candidate Import",
    description: "Easily import candidate lists from spreadsheets or other ATS systems."
  },
  {
    icon: Shield,
    title: "Secure Video Storage",
    description: "All video submissions are securely stored and accessible only to authorized team members."
  },
  {
    icon: Clock,
    title: "14-Day Free Trial",
    description: "Try all features risk-free with our comprehensive 14-day trial period."
  },
  {
    icon: Building2,
    title: "Company Dashboard",
    description: "Get insights into your hiring process with analytics and response rate tracking."
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
              Everything You Need for Modern Hiring
            </h1>
            <p className="text-xl text-muted-foreground">
              VibeCheck provides all the tools you need to streamline your hiring process with video interviews.
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