import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { CheckCircle2, Upload, Video, PhoneCall } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  {
    title: "Add Candidates",
    description: "Multiple ways to add candidates to your hiring pipeline",
    features: [
      "Create an open job with public application",
      "Import candidates via .CSV (ie. from Indeed)",
      "Manually add candidates"
    ],
    icon: Upload
  },
  {
    title: "Request Videos",
    description: "Streamlined process to request video introductions",
    features: [
      "Invite candidates with text and email",
      "Copy unique URL's for each candidate",
      "Easy recording for candidates"
    ],
    icon: Video
  },
  {
    title: "Review Videos",
    description: "Efficiently evaluate and manage candidates",
    features: [
      "Easy review queue to approve and reject",
      "Call candidates directly from web app",
      "View metrics including response rate"
    ],
    icon: PhoneCall
  }
];

const Index = () => {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*');

      if (error) throw error;
      return data;
    }
  });

  const plan = plans?.[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Transform Your Hiring Process with Candidate Videos
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Screen candidates efficiently with asynchronous video interviews. Save time and make better hiring decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start 14-Day Free Trial
                  </Button>
                </Link>
                <Link to="/features">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Features
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col space-y-4 p-6 rounded-lg border bg-card"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">
                        {index + 1}. {step.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2">
                          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-12">Simple, Transparent Pricing</h2>
              {isLoading ? (
                <div className="animate-pulse bg-white rounded-lg shadow-lg p-8">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              ) : plan ? (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6 py-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price_monthly}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <ul className="mt-6 space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <CheckCircle2 className="h-5 w-5 text-success" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/signup" className="mt-8 block">
                      <Button className="w-full">Start 14-Day Free Trial</Button>
                    </Link>
                    <p className="mt-4 text-sm text-gray-600">
                      No credit card required for trial
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;