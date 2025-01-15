import { Button } from "@/components/ui/button";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { SignUpFields } from "./SignUpFields";

export function SignUpForm() {
  const { isLoading, handleSignUp } = useSignUpForm();

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSignUp(new FormData(e.currentTarget));
    }} className="space-y-4">
      <SignUpFields />
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}