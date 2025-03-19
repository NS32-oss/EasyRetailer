import React from "react";
import ReactDOM from "react-dom/client";
import { Routes } from "./routes";
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./index.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider defaultTheme="system" enableSystem>
        <Routes />
        <Toaster />
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>
);
