import { FC, useState } from "react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocation } from "wouter";
import { AlertCircle } from "lucide-react";

const Login: FC = () => {
  const { login, isLoading } = useGoogleAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = async () => {
    try {
      await login();
      setLocation('/');
      toast({
        title: "Login successful",
        description: "You've been successfully logged in",
      });
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
      
      // Check if error is related to popup blockers
      if (errorMessage.includes("Popup blocked")) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site and try again.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("redirect_uri_mismatch") || 
                errorMessage.includes("Authentication failed") ||
                errorMessage.includes("OAuth service")) {
        toast({
          title: "Authentication failed",
          description: "Could not authenticate with Google. Click 'Need Help?' for instructions.",
          variant: "destructive",
        });
        setActiveTab("help");
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="help">Need Help?</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
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
                  className="flex items-center justify-center w-full bg-google-blue hover:bg-blue-600 space-x-2 text-primary hover:text-white"
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
              <CardFooter className="flex justify-center text-sm text-muted-foreground">
                <p>No registration required. Sign in with your existing Google account.</p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Help</CardTitle>
                <CardDescription>
                  Troubleshooting common sign-in issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Common OAuth Login Issues</AlertTitle>
                  <AlertDescription>
                    We've identified the most common issues when signing in with Google.
                  </AlertDescription>
                </Alert>
                
                <div className="divide-y divide-border">
                  <div className="pb-4 space-y-2">
                    <h3 className="font-medium">Popup Blocked</h3>
                    <p className="text-sm text-muted-foreground">
                      This application uses popup windows for Google authentication. If you see "Popup Blocked" error:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Look for the popup blocker icon in your browser's address bar</li>
                      <li>Click on it and select "Always allow popups from this site"</li>
                      <li>Try signing in again</li>
                    </ol>
                  </div>
                  
                  <div className="py-4 space-y-2">
                    <h3 className="font-medium">Error 400: redirect_uri_mismatch</h3>
                    <p className="text-sm text-muted-foreground">
                      This error occurs when the redirect URI in your Google OAuth configuration doesn't match what the app is using.
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Cloud Console</a></li>
                      <li>Select your project and find the OAuth 2.0 Client ID you're using</li>
                      <li>Add the following URL to the list of authorized redirect URIs:
                        <div className="bg-muted p-2 mt-1 rounded-md overflow-x-auto text-xs">
                          https://{window.location.hostname}/api/auth/google/callback
                        </div>
                      </li>
                      <li>Also add this local development URL:
                        <div className="bg-muted p-2 mt-1 rounded-md overflow-x-auto text-xs">
                          http://localhost:5000/api/auth/google/callback
                        </div>
                      </li>
                      <li>Save your changes and try signing in again</li>
                    </ol>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <h3 className="font-medium">Authentication Timed Out</h3>
                    <p className="text-sm text-muted-foreground">
                      If your authentication process takes too long or seems to hang:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Try refreshing the page and attempting to sign in again</li>
                      <li>Make sure you're using a stable internet connection</li>
                      <li>Check if Google's authentication services are experiencing issues</li>
                      <li>Try using a different browser if the problem persists</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("login")}
                  >
                    <span className="material-icons mr-2">arrow_back</span>
                    Back to Login
                  </Button>
                  <Button 
                    variant="default"
                    className="w-full bg-google-blue hover:bg-blue-600"
                    onClick={() => window.location.reload()}
                  >
                    <span className="material-icons mr-2">refresh</span>
                    Try Again
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;