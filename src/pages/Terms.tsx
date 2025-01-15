import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Terms = () => {
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
        
        <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
        
        <div className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using VibeCheck, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">2. Video Interview Services</h2>
            <p className="text-gray-700 mb-4">
              Our platform provides video interview and candidate assessment services. Users may create, record, and share video submissions for recruitment purposes. All content must be professional and appropriate for a business context.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">3. SMS Communications</h2>
            <p className="text-gray-700 mb-4">
              By providing your phone number and consenting to SMS communications, you agree to receive text messages from VibeCheck regarding your job applications and video interview requests. Message and data rates may apply. Message frequency varies based on your application status and employer communications.
            </p>
            <p className="text-gray-700 mb-4">
              You can opt out of SMS communications at any time by replying STOP to any message. Reply HELP for assistance. Opting out of SMS messages may impact our ability to notify you about time-sensitive interview requests or application updates.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">4. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">
              Users are responsible for maintaining the confidentiality of their account credentials and for all activities conducted through their account. Users must not share access to their account or misuse the platform in any way.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">5. Privacy and Data Protection</h2>
            <p className="text-gray-700 mb-4">
              We collect and process personal information in accordance with our Privacy Policy. Video submissions and user data are stored securely and handled with appropriate confidentiality measures.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">6. Content Ownership</h2>
            <p className="text-gray-700 mb-4">
              Users retain ownership of their content but grant VibeCheck a license to store, process, and transmit content as necessary to provide our services. We do not claim ownership of user-submitted content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">7. Service Modifications</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify, suspend, or discontinue any part of our services at any time. We will provide reasonable notice of any significant changes that affect user access or functionality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              VibeCheck is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use or inability to use our services, including but not limited to direct, indirect, incidental, or consequential damages.
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

export default Terms;