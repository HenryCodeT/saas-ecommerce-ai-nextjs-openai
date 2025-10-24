// NextAuth API Route Handler
// Handles all authentication requests
// Configured with authOptions from lib/auth.ts

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
