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
    title: "Video Interview Platform",
    description: "Screen candidates efficiently with pre-recorded video submissions. Review and evaluate responses at your convenience.",
    image: "/lovable-uploads/388035ef-8cbe-472a-8e39-0f87ff9b2f55.png"
  },
  {
    icon: Users,
    title: "Comprehensive Candidate Management",
    description: "Track all candidates in one place with our intuitive dashboard. Monitor video response rates and review status.",
    image: "/lovable-uploads/104b8677-3217-4914-9739-d5411b37b59b.png"
  },
  {
    icon: FileSpreadsheet,
    title: "Bulk Candidate Import",
    description: "Save time by importing multiple candidates via CSV. Easily upload candidate lists with our simple template.",
    image: "/lovable-uploads/ec2c9532-cce8-4948-9b2b-b619e6f12935.png"
  },
  {
    icon: MessageSquare,
    title: "Streamlined Job Postings",
    description: "Create and manage detailed job listings with custom requirements and descriptions. Track applications in real-time.",
    image: "/lovable-uploads/67b0c217-7bca-4a45-b403-c56b959e6b98.png"
  },
  {
    icon: Bell,
    title: "Automated Video Invites",
    description: "Send automated video interview requests to candidates. Track response rates and follow up with ease.",
    image: "/lovable-uploads/df5493e2-3eb5-49f6-8040-5b36cbeb4193.png"
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
              Streamline your hiring process with asynchronous video interviews and comprehensive candidate management.
            </p>
          </div>

          <div className="space-y-20">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={index} 
                  className={`flex flex-col lg:flex-row gap-8 items-center ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  <div className="flex-1 space-y-4">
                    <Card className="border-none shadow-none">
                      <CardHeader>
                        <Icon className="h-12 w-12 text-primary mb-4" />
                        <CardTitle className="text-2xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex-1">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="rounded-lg shadow-lg w-full"
                    />
                  </div>
                </div>
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