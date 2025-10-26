import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthContextProvider } from "./contexts/AuthContextProvider";
import App from "./App.tsx";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        {/* <ThemeProvider attribute="class"> */}
          <App />
        {/* </ThemeProvider> */}
      </AuthContextProvider>
    </QueryClientProvider>
  </ConvexAuthProvider>
);
