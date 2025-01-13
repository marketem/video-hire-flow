import { Card, CardContent } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect information that you provide directly to us, including your name, email address, and video submissions. We also automatically collect certain information about your device when you use our platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">2. Use of Information</h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect to provide and improve our video interview services, communicate with you, and ensure platform security. Your video submissions are only shared with the intended hiring organizations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">3. Data Storage and Security</h2>
            <p className="text-gray-700 mb-4">
              All data, including video submissions, is stored securely using industry-standard encryption. We implement appropriate technical and organizational measures to protect your personal information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">4. Data Sharing</h2>
            <p className="text-gray-700 mb-4">
              We share your information only with the hiring organizations you apply to through our platform. We do not sell your personal information to third parties. We may share data with service providers who assist in our operations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the right to access, correct, or delete your personal information. You can also request a copy of your data or withdraw consent for its processing. Contact us to exercise these rights.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to improve your experience on our platform. You can control cookie preferences through your browser settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">7. Changes to Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.
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

export default Privacy;