import { Suspense } from "react";
import { ResetPasswordFallback, ResetPasswordFlow } from "@/features/auth/components/reset-password-flow";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordFlow />
    </Suspense>
  );
}
