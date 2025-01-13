import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/658547e3-9dac-4df0-84d6-a891876840a9.png" 
              alt="VibeCheck Logo" 
              className="h-8 w-auto"
            />
            <span className="text-2xl font-bold text-black">VibeCheck</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};