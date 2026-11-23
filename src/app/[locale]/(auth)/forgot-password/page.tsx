import { ForgotPasswordScreen } from "@/features/auth/components/forgot-password-screen";
import { pageMetadata } from "@/lib/page-metadata";

export const generateMetadata = () => pageMetadata("forgotPassword");

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}
