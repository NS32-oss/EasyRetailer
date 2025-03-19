import React from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";

export default function RootLayout({ children }) {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>EasyRetailer</title>
          <meta name="description" content="Retail management system for men's clothing" />
        </head>
        <body className="min-h-screen bg-background font-sans antialiased">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SidebarProvider>
              <div className="relative flex min-h-screen flex-col">
                <AppSidebar />
                <div className="flex-1">{children}</div>
              </div>
              <Toaster />
            </SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}