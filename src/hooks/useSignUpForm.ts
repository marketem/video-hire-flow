import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useSignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const companyName = formData.get("companyName") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    try {
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      // Get the current origin for the redirect URL
      const origin = window.location.origin;
      const redirectTo = `${origin}/login?verified=true`;

      console.log('Redirect URL:', redirectTo); // Add this to debug

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName,
            first_name: firstName,
            last_name: lastName,
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
          emailRedirectTo: redirectTo,
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        
        if (signUpError.message.includes('User already registered')) {
          throw new Error("User already exists");
        }
        throw signUpError;
      }

      if (!signUpData?.user) {
        throw new Error("Failed to create account");
      }

      console.log('Signup successful:', signUpData);
      navigate('/email-verification-sent');
    } catch (error) {
      console.error('Signup process error:', error);
      
      toast({
        title: "Error",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSignUp,
  };
}