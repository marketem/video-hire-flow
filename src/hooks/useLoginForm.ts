import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error("Login error:", error.message);
        
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again or click here to sign up if you don't have an account.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "An error occurred during login. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (data?.user) {
        toast({
          title: "Success",
          description: "You've successfully logged in!",
        });
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
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