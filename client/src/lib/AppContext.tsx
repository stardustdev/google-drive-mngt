import { createContext, useContext, ReactNode } from "react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

// Define the context type
interface AppContextType {
  user: ReturnType<typeof useGoogleAuth>["user"];
  isLoading: ReturnType<typeof useGoogleAuth>["isLoading"];
  login: ReturnType<typeof useGoogleAuth>["login"];
  logout: ReturnType<typeof useGoogleAuth>["logout"];
  isAuthenticated: ReturnType<typeof useGoogleAuth>["isAuthenticated"];
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export function AppContextProvider({ children }: { children: ReactNode }) {
  const auth = useGoogleAuth();
  
  return (
    <AppContext.Provider value={auth}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the app context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
