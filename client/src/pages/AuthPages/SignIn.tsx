import { SignIn } from "@clerk/clerk-react";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function SignInPage() {
  return (
    <>
      <PageMeta
        title="EasyRetailer - Sign In | Retail Management Dashboard"
        description="Sign in to EasyRetailer, the retail management system for seamless inventory, sales, and employee management."
      />
      <AuthLayout>
        <SignIn path="/signin" routing="path" />
      </AuthLayout>
    </>
  );
}