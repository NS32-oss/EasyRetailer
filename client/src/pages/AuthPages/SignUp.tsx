import { SignUp } from "@clerk/clerk-react";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function SignUpPage() {
  return (
    <>
      <PageMeta
        title="EasyRetailer - Sign Up | Retail Management Dashboard"
        description="Register to EasyRetailer, the retail management system for seamless inventory, sales, and employee management."
      />
      <AuthLayout>
        <SignUp path="/signup" routing="path" />
      </AuthLayout>
    </>
  );
}