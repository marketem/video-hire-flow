import { LoginForm } from "@/components/auth/LoginForm";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function Login() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const supabase = useSupabaseClient();

  useEffect(() => {
    const handleEmailVerification = async () => {
      const verified = searchParams.get("verified") === "true";
      const error = searchParams.get("error_description");

      if (verified) {
        // Get the user's details
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: metadata } = await supabase.from('auth.users')
            .select('raw_user_meta_data')
            .eq('id', user.id)
            .single();

          if (metadata?.raw_user_meta_data) {
            const { first_name, trial_ends_at } = metadata.raw_user_meta_data;

            // Send welcome email
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                email: user.email,
                firstName: first_name,
                trialEndsAt: trial_ends_at,
              },
            });
          }
        }

        toast({
          title: "Email Verified",
          description: "Your email has been verified successfully. You can now log in.",
        });
      } else if (error) {
        toast({
          title: "Verification Error",
          description: decodeURIComponent(error),
          variant: "destructive",
        });
      }
    };

    handleEmailVerification();
  }, [searchParams, toast, supabase]);

  return (
    <>
      <div className="fixed top-4 left-4">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/658547e3-9dac-4df0-84d6-a891876840a9.png" 
            alt="VibeCheck Logo" 
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold">VibeCheck</span>
        </Link>
      </div>
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-blue-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/658547e3-9dac-4df0-84d6-a891876840a9.png" 
                alt="VibeCheck Logo" 
                className="h-8 w-auto mr-2"
              />
              <span className="text-white">VibeCheck</span>
            </Link>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "VibeCheck has completely transformed our hiring process. We're able to screen candidates more efficiently than ever before."
              </p>
              <footer className="text-sm">Sarah Chen, HR Director</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your account
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  );
}