import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import { inter } from "../fonts";

// Root layout of the provided /code helper, which stays outside the localized routes.
export const metadata: Metadata = { title: "/code — Stolos" };

export default function CodeLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
