import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="EasyRetailer - Sign Up | Retail Management Dashboard"
        description="Register to EasyRetailer, the retail management system for seamless inventory, sales, and employee management."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
