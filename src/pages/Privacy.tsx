import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="py-8">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/658547e3-9dac-4df0-84d6-a891876840a9.png" 
              alt="VibeCheck Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold">VibeCheck</span>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect information that you provide directly to us, including your name, email address, and any video content you submit through our platform. We also automatically collect certain information about your device when you use our services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to provide and improve our services, communicate with you, and ensure the security of our platform. Your video submissions are only shared with the intended hiring managers and recruiters.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">3. Data Storage and Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information. Your data is stored securely on our servers, and we regularly review and update our security practices.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">4. Video Content</h2>
              <p className="text-gray-700 mb-4">
                Video submissions are stored securely and are only accessible to authorized personnel. We do not use your video content for any purpose other than facilitating the recruitment process you've applied for.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to access, correct, or delete your personal information. You can also request a copy of your data or withdraw your consent for its processing. Contact us to exercise any of these rights.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">6. Updates to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date.
              </p>
            </CardContent>
          </Card>

          <p className="text-sm text-gray-500 mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;