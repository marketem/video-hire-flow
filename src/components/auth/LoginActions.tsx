import { Link } from "react-router-dom";

export function LoginActions() {
  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      <p>First time? Please <Link to="/signup" className="text-primary hover:underline">sign up</Link> before attempting to log in.</p>
      <p>
        <Link to="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </p>
    </div>
  );
}