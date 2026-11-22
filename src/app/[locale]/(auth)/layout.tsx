import Image from "next/image";
import type { ReactNode } from "react";
import { AuthBackground } from "@/features/auth/components/auth-background";
import { Fleet } from "@/features/companies/components/fleet";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-svh w-full flex-1 flex-col items-center px-m">
      <AuthBackground />
      <Fleet />
      <div className="auth-stage flex w-full flex-1 flex-col items-center">
        <header className="relative mt-[clamp(1.5rem,8.7svh,5.875rem)] mb-[1.5625rem] shrink-0 [@media(max-height:60rem)]:my-m">
          <Image src="/brand/stolos-logo-3d.png" alt="Stolos" width={169} height={167} loading="eager" />
        </header>
        <main className="relative flex w-full flex-1 flex-col items-center">
          <div className="flex-[1_1_0]" />
          {children}
          <div className="flex-[1_1_clamp(0rem,calc(100svh_-_57.875rem),9.625rem)] [@media(max-height:60rem)]:grow-[4]" />
        </main>
      </div>
    </div>
  );
}
