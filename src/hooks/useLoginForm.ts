import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

export function useLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();

  const getErrorMessage = (error: AuthError) => {
    console.error("Auth error details:", error);
    
    if (error instanceof AuthApiError) {
      // Check if the error message contains any indication of email verification
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('email not confirmed') || 
          errorMessage.includes('email confirmation') ||
          errorMessage.includes('verify')) {
        return "Please check your email for the verification link before logging in.";
      }

      switch (error.status) {
        case 400:
          return "Please verify your email before logging in. Check your inbox for the verification link.";
        case 401:
          return "Please verify your email before logging in. Check your inbox for the verification link.";
        case 403:
          return "Email not confirmed. Please check your email for verification link.";
        case 422:
          return "Please verify your email before logging in.";
        default:
          return "Invalid email or password. Please try again.";
      }
    }
    return "Invalid email or password. Please try again.";
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Attempting login with email:", email);

    try {
      if (!email || !password) {
        toast({
          title: "Login Failed",
          description: "Please enter both email and password.",
          variant: "destructive",
        });
        return;
      }

      // First attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        
        // Check if the error is related to email verification
        if (error.message.toLowerCase().includes('email not confirmed')) {
          toast({
            title: "Email Verification Required",
            description: "Please check your email for the verification link before logging in.",
            variant: "default",
          });
          return;
        }
        
        toast({
          title: "Login Failed",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return;
      }

      if (data?.user) {
        console.log("Login successful, user:", data.user);
        
        // Verify session is active
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session verification error:", sessionError);
          throw sessionError;
        }

        if (!sessionData.session) {
          console.error("No active session found after login");
          throw new Error("Failed to establish session");
        }
        
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
  };
}