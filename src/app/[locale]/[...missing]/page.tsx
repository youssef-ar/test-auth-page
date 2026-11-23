import { notFound } from "next/navigation";

// Any unknown path under /fr or /en renders the localized not-found page inside the locale layout.

// This segment always 404s, so there is nothing for instant-navigation validation to check.
export const instant = false;

export default function MissingPage() {
  notFound();
}
