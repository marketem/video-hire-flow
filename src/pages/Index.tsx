import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const features = [
  "Asynchronous video interviews",
  "Unlimited job postings",
  "Candidate management",
  "SMS notifications",
  "Team collaboration",
  "Custom branding",
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Transform Your Hiring Process with Video Interviews
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
                <Link to="/demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything You Need to Streamline Hiring
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
                  <span className="text-lg text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-12">Simple, Transparent Pricing</h2>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Annual Plan</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$199</span>
                    <span className="text-gray-600">/year</span>
                  </div>
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span>Unlimited job postings</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span>Unlimited video interviews</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span>SMS notifications included</span>
                    </li>
                  </ul>
                  <Link to="/signup" className="mt-8 block">
                    <Button className="w-full">Start 14-Day Free Trial</Button>
                  </Link>
                  <p className="mt-4 text-sm text-gray-600">
                    No credit card required for trial
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;