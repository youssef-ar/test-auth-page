import { Suspense } from "react";
import { ResetPasswordFallback, ResetPasswordFlow } from "@/features/auth/components/reset-password-flow";
import { pageMetadata } from "@/lib/page-metadata";

export const generateMetadata = () => pageMetadata("resetPassword");

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordFlow />
    </Suspense>
  );
}
