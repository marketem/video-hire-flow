import { Link } from "react-router-dom";

export default function EmailVerificationSent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/658547e3-9dac-4df0-84d6-a891876840a9.png" 
            alt="VibeCheck Logo" 
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold">VibeCheck</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              You're almost there! 🎉
            </h1>
            <p className="text-sm text-muted-foreground">
              Great! We've sent a verification link to your email inbox. Click the link to activate your account and start discovering amazing opportunities with VibeCheck. Can't find the email? Don't forget to check your spam folder!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}