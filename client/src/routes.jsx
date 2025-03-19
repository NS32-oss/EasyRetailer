import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";
import { Spinner } from "@/components/ui/spinner";

import SignInPage from "@/pages/auth/sign-in";
import SignUpPage from "@/pages/auth/sign-up";
import DashboardPage from "@/pages/dashboard";
import InventoryPage from "@/pages/inventory";
import SalesPage from "@/pages/sales";
import ReturnsPage from "@/pages/returns";
import ReportsPage from "@/pages/reports";
import EmployeesPage from "@/pages/employees";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <ClerkLoading>
        <div className="flex h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignedIn>{children}</SignedIn>
        <SignedOut>
          <Navigate to="/sign-in" replace />
        </SignedOut>
      </ClerkLoaded>
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/sign-in",
    element: (
      <ClerkLoaded>
        <SignedIn>
          <Navigate to="/dashboard" replace />
        </SignedIn>
        <SignedOut>
          <SignInPage />
        </SignedOut>
      </ClerkLoaded>
    ),
  },
  {
    path: "/sign-up",
    element: (
      <ClerkLoaded>
        <SignedIn>
          <Navigate to="/dashboard" replace />
        </SignedIn>
        <SignedOut>
          <SignUpPage />
        </SignedOut>
      </ClerkLoaded>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/inventory",
    element: (
      <ProtectedRoute>
        <InventoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sales",
    element: (
      <ProtectedRoute>
        <SalesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/returns",
    element: (
      <ProtectedRoute>
        <ReturnsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <ReportsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/employees",
    element: (
      <ProtectedRoute>
        <EmployeesPage />
      </ProtectedRoute>
    ),
  },
]);

export function Routes() {
  return <RouterProvider router={router} />;
}
