import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://videovibecheck.com/reset-password?type=recovery",
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Email Sent",
        description: "If an account exists with this email, you will receive a password reset link.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-blue-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img 
            src="/lovable-uploads/658547e3-9dac-4df0-84d6-a891876840a9.png" 
            alt="VibeCheck Logo" 
            className="h-8 w-auto mr-2"
          />
          VibeCheck
        </div>
      </div>
      <div className="lg:p-8">
        {/* Add logo for mobile view */}
        <div className="flex items-center justify-center mb-8 lg:hidden">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/658547e3-9dac-4df0-84d6-a891876840a9.png" 
              alt="VibeCheck Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold">VibeCheck</span>
          </Link>
        </div>
        
        {/* Centered header and description */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Forgot Password
          </h1>
          <p className="text-sm text-muted-foreground">
            We'll send you a reset email from Supabase Auth
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}