import { Button } from "@/components/ui/button";
import { useLoginForm } from "@/hooks/useLoginForm";
import { LoginFields } from "./LoginFields";
import { LoginActions } from "./LoginActions";

export function LoginForm() {
  const {
    isLoading,
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
  } = useLoginForm();

  return (
    <div className="space-y-6">
      <form onSubmit={handleLogin} className="space-y-4">
        <LoginFields
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </form>
      <LoginActions />
    </div>
  );
}