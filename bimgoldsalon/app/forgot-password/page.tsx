import AuthCardLayout from "@/components/auth/AuthCardLayout";
import ForgotPasswordClient from "@/components/auth/ForgotPasswordClient";

const ForgotPasswordPage = () => (
  <AuthCardLayout
    heading="No worries!"
    subheading="We will help you get back into your account"
    backTo={{ label: "Sign In", href: "/auth" }}
  >
    <ForgotPasswordClient />
  </AuthCardLayout>
);

export default ForgotPasswordPage;
