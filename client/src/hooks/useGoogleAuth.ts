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
      // First check if the Google OAuth endpoint is available
      const checkResponse = await fetch("/api/auth/google", {
        method: "HEAD",
        credentials: "include",
        // Don't follow redirects in the check
        redirect: "manual"
      });
      
      // If we got a redirect response, it means the OAuth endpoint is working
      if (checkResponse.type === "opaqueredirect") {
        window.location.href = "/api/auth/google";
        return;
      } else {
        throw new Error("OAuth service unavailable");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Login failed",
        description: "Could not connect to Google OAuth service. Please check your configuration.",
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
