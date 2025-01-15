import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const ContactSuccess = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/658547e3-9dac-4df0-84d6-a891876840a9.png" 
            alt="VibeCheck Logo" 
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold">VibeCheck</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Message Sent!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for reaching out. We'll get back to you as soon as possible.
          </p>
          <Link to="/">
            <Button className="w-full">Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContactSuccess;