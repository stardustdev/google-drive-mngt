import { FC, ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

interface AuthLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useGoogleAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      // If auth is required but user is not authenticated, redirect to login
      if (requireAuth && !isAuthenticated && location !== "/login") {
        window.location.href = "/login";
      }
      
      // If user is authenticated and trying to access login page, redirect to home
      if (isAuthenticated && location === "/login") {
        window.location.href = "/";
      }
    }
  }, [isAuthenticated, isLoading, location, requireAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-b-2 border-google-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthLayout;