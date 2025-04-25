import { FC } from "react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocation } from "wouter";

const Login: FC = () => {
  const { login, isLoading } = useGoogleAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogin = async () => {
    try {
      await login();
      setLocation('/');
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Could not authenticate with Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full">
        <Card className="border-border">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="https://www.gstatic.com/images/branding/product/1x/drive_48dp.png" 
                alt="Google Drive logo" 
                className="w-12 h-12 mr-4" 
              />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Google Drive</h1>
            </div>
            <CardTitle className="text-xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Access your Drive files and documents
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Button 
              className="flex items-center justify-center w-full bg-google-blue hover:bg-blue-600 space-x-2"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-icons text-white">login</span>
                  <span>Sign in with Google</span>
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            <p>No registration required. Sign in with your existing Google account.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;