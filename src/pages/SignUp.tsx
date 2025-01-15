import { SignUpForm } from "@/components/auth/SignUpForm";
import { Link } from "react-router-dom";

export default function SignUp() {
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
                Start Your Free Trial
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your details to start your 14-day free trial
              </p>
            </div>
            <SignUpForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}