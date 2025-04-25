import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GoogleUser } from "@/lib/types";
import { queryClient } from "@/lib/queryClient";

export function useGoogleAuth() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already authenticated on mount
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthStatus();
  }, []);

  const login = async () => {
    try {
      // Create popup window for OAuth flow
      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        "/api/auth/google",
        "GoogleLoginWindow",
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
      );
      
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }
      
      // Create a promise that will resolve when the popup completes OAuth flow
      return new Promise<void>((resolve, reject) => {
        // Check for popup closure
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            clearInterval(checkAuth);
            
            // Check one more time if authentication was successful
            fetch("/api/auth/user", { credentials: "include" })
              .then(res => {
                if (res.ok) {
                  return res.json();
                } else {
                  throw new Error("Authentication failed or was cancelled");
                }
              })
              .then(userData => {
                setUser(userData);
                resolve();
              })
              .catch(err => {
                reject(err);
              });
          }
        }, 500);
        
        // Periodically check if user has been authenticated while popup is open
        const checkAuth = setInterval(() => {
          fetch("/api/auth/user", { credentials: "include" })
            .then(res => {
              if (res.ok) {
                return res.json();
              }
              return null;
            })
            .then(userData => {
              if (userData) {
                clearInterval(checkClosed);
                clearInterval(checkAuth);
                popup.close();
                setUser(userData);
                resolve();
              }
            })
            .catch(err => {
              console.error("Error checking auth in interval:", err);
            });
        }, 1000);
        
        // Set a timeout to prevent indefinite polling
        setTimeout(() => {
          if (!popup.closed) {
            clearInterval(checkClosed);
            clearInterval(checkAuth);
            reject(new Error("Authentication timed out"));
          }
        }, 120000); // 2 minute timeout
      });
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Login failed",
        description: typeof error === 'object' && error !== null ? (error as Error).message : "Could not connect to Google OAuth service",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest("GET", "/api/auth/logout", undefined);
      setUser(null);
      
      // Invalidate all queries to force refetch on next render
      queryClient.invalidateQueries();
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
