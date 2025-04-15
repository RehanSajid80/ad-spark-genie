
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-purple-gradient flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-ad-gray-dark">404</h1>
        <p className="text-xl text-ad-gray-dark mb-6">Oops! Page not found</p>
        <p className="text-ad-gray mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="w-full">
          <a href="/">Return to Ad Spark Genie</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
