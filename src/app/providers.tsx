// Providers Component
// Wraps application with NextAuth SessionProvider
// Must be a client component to use SessionProvider

"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
