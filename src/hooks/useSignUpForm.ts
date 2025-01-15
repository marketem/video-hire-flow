import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

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
          emailRedirectTo: `${window.location.origin}/login?verified=true`,
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        
        if (signUpError instanceof AuthApiError && signUpError.status === 422) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please try logging in instead.",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }
        
        throw signUpError;
      }

      if (signUpData?.user) {
        console.log('Signup successful:', signUpData);
        navigate('/email-verification-sent');
        return;
      }
    } catch (error) {
      console.error('Signup process error:', error);
      
      let errorMessage = "An unexpected error occurred during signup";
      
      if (error instanceof AuthApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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