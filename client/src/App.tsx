import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppContextProvider } from "@/lib/AppContext";
import AuthLayout from "@/components/AuthLayout";

function MyRouter() {
  return (
    <Switch>
      <Route path="/login">
        <AuthLayout requireAuth={false}>
          <Login />
        </AuthLayout>
      </Route>
      <Route path="/">
        <AuthLayout>
          <Home />
        </AuthLayout>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="system" storageKey="drive-theme">
          <AppContextProvider>
            <WouterRouter>
              <div className="min-h-screen bg-background text-foreground">
                <Toaster />
                <MyRouter />
              </div>
            </WouterRouter>
          </AppContextProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
