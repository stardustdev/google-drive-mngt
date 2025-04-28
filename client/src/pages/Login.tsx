import { FC } from "react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocation } from "wouter";

const Login: FC = () => {
  const { login, isLoading } = useGoogleAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogin = async () => {
    try {
      await login();

      // Force a full page refresh to ensure all components are properly initialized
      window.location.href = "/";

      toast({
        title: "Login successful",
        description: "You've been successfully logged in",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Check if error is related to popup blockers
      if (errorMessage.includes("Popup blocked")) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full">
        <Card className="border-border shadow-md">
          <CardHeader className="space-y-2">
            <CardDescription className="text-center">
              <div className="flex items-center justify-center">
                <img
                  src="https://www.gstatic.com/images/branding/product/1x/drive_48dp.png"
                  alt="Google Drive logo"
                  className="w-12 h-12 mr-4"
                />
                <h1 className="text-2xl font-bold tracking-tight text-primary">
                  Drive Manager
                </h1>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Button
              className="flex items-center justify-center w-full space-x-2 btn-theme-filled"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-icons">login</span>
                  <span>Sign in with Google</span>
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground"></CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
