// filepath: c:\EasyRetailer\client\src\main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <AppWrapper>
          <SignedIn>
            <App />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </AppWrapper>
      </ThemeProvider>
    </ClerkProvider>
  </StrictMode>
);
