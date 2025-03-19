import  React from "react"
import { Link } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function SignInPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">EasyRetailer</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none p-0 border-0",
                header: "hidden",
                footer: "hidden",
              },
            }}
            redirectUrl="/dashboard"
          />

          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/sign-up" className="font-medium text-primary underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
