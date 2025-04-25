import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppContextProvider } from "./lib/AppContext";
import { ThemeProvider } from "./components/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </ThemeProvider>
);
