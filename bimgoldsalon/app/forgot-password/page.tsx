import AuthCardLayout from "@/components/auth/AuthCardLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const ForgotPasswordPage = () => (
  <AuthCardLayout
    heading="No worries!"
    subheading="We will help you get back into your account"
    backTo={{ label: "Sign In", href: "/auth" }}
  >
    <ForgotPasswordForm />
  </AuthCardLayout>
);

export default ForgotPasswordPage;
