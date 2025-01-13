import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="container mx-auto py-12 px-4">
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
            <h2 className="text-xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">
              Users are responsible for maintaining the confidentiality of their account credentials and for all activities conducted through their account. Users must not share access to their account or misuse the platform in any way.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">4. Privacy and Data Protection</h2>
            <p className="text-gray-700 mb-4">
              We collect and process personal information in accordance with our Privacy Policy. Video submissions and user data are stored securely and handled with appropriate confidentiality measures.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">5. Content Ownership</h2>
            <p className="text-gray-700 mb-4">
              Users retain ownership of their content but grant VibeCheck a license to store, process, and transmit content as necessary to provide our services. We do not claim ownership of user-submitted content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">6. Service Modifications</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify, suspend, or discontinue any part of our services at any time. We will provide reasonable notice of any significant changes that affect user access or functionality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
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
  );
};

export default Terms;