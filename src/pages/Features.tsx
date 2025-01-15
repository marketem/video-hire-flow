import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Video, 
  Users, 
  MessageSquare, 
  Bell, 
  FileSpreadsheet
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type FeatureImage = {
  src: string;
  alt: string;
}

type BaseFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
}

type SingleImageFeature = BaseFeature & {
  image: string;
}

type MultiImageFeature = BaseFeature & {
  images: FeatureImage[];
}

type Feature = SingleImageFeature | MultiImageFeature;

const features: Feature[] = [
  {
    icon: Users,
    title: "Hiring Dashboard",
    description: "Track all candidates in one place with our intuitive dashboard. Monitor video response rates and review status.",
    image: "/lovable-uploads/104b8677-3217-4914-9739-d5411b37b59b.png"
  },
  {
    icon: Bell,
    title: "Automated Video Invites",
    description: "Send automated video interview requests to candidates. Track response rates and follow up with ease.",
    images: [
      {
        src: "/lovable-uploads/df5493e2-3eb5-49f6-8040-5b36cbeb4193.png",
        alt: "Video invite email"
      },
      {
        src: "/lovable-uploads/d41c1b8c-c037-4bfe-b022-c6b159569574.png",
        alt: "Video recording interface"
      }
    ]
  },
  {
    icon: Video,
    title: "Review and Manage Candidate Submissions",
    description: "Screen candidates efficiently with pre-recorded video submissions. Review and evaluate responses at your convenience.",
    image: "/lovable-uploads/388035ef-8cbe-472a-8e39-0f87ff9b2f55.png"
  },
  {
    icon: FileSpreadsheet,
    title: "Add Candidates via Upload or Job Post",
    description: "Easily import candidates from your favorite job platform like Indeed or ZipRecruiter using a .CSV file. Save time by importing multiple candidates or create detailed job listings with custom requirements.",
    images: [
      {
        src: "/lovable-uploads/17c52080-5b12-4346-a55c-f23143f5af60.png",
        alt: "Job posting form"
      },
      {
        src: "/lovable-uploads/9f2d2b4c-1520-4481-bfc3-994ee0a959fa.png",
        alt: "Candidates upload interface"
      }
    ]
  }
];

const Features = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Modern Video Hiring Platform
            </h1>
            <p className="text-xl text-muted-foreground">
              Streamline your hiring process with asynchronous video interviews and comprehensive candidate management.
            </p>
          </div>

          <div className="space-y-12">
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
                    {'image' in feature ? (
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="rounded-lg shadow-lg w-4/5 mx-auto"
                      />
                    ) : 'images' in feature ? (
                      <div className="grid grid-cols-2 gap-4">
                        {feature.images.map((img, imgIndex) => (
                          <img 
                            key={imgIndex}
                            src={img.src} 
                            alt={img.alt}
                            className="rounded-lg shadow-lg w-full"
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action Section */}
          <div className="mt-20 text-center">
            <div className="max-w-2xl mx-auto bg-primary/5 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your Hiring Process?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Start your 14-day free trial today. No credit card required.
              </p>
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Features;