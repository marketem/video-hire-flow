import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const ContactSuccess = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
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
  );
};

export default ContactSuccess;