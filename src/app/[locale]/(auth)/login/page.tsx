import { LoginScreen } from "@/features/auth/components/login-screen";
import { pageMetadata } from "@/lib/page-metadata";

export const generateMetadata = () => pageMetadata("login");

export default function LoginPage() {
  return <LoginScreen />;
}
