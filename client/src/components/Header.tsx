import { FC, useState, useRef, useEffect } from "react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocation } from "wouter";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, login, logout, isLoading } = useGoogleAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async () => {
    try {
      await login();
      
      // After successful login, force a page refresh to ensure all components
      // reflect the authenticated state and proper data is loaded
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Could not authenticate with Google",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Don't navigate manually - let the AuthLayout handle navigation
      // based on authentication state
      setIsUserMenuOpen(false);
      
      // Force a refresh of the current page to ensure all state is reset
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Could not log out properly",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-background border-b border-border h-16 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-google-gray"
        >
          <span className="material-icons">menu</span>
        </button>
        <h1 className="ml-3 text-lg font-medium">Drive Manager</h1>
      </div>

      <div className="relative w-full max-w-md hidden md:block">
        <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          search
        </span>
        <input
          type="text"
          placeholder="Search in Drive"
          className="w-full pl-10 pr-4 py-2 border border-google-dark-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-google-blue"
        />
      </div>

      <div className="flex items-center space-x-3">
        <ThemeToggle variant="outline" size="icon" />

        {isLoading ? (
          <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
        ) : !user ? (
          <button
            onClick={handleLogin}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
          >
            <span className="material-icons">login</span>
            <span>Login with Google</span>
          </button>
        ) : (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 hover:bg-muted rounded-full p-1"
            >
              <img
                src={
                  user.picture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4285F4&color=fff`
                }
                alt="User avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden md:inline">{user.name}</span>
              <span className="material-icons text-gray-600">
                arrow_drop_down
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1 z-10 border border-border">
                <div className="block px-4 py-2 text-sm text-foreground">
                  {user.email}
                </div>
                <div className="border-t border-border"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-sm text-primary hover:text-white hover:bg-primary"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
