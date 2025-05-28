import NextAuth, { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

// Extend the default Session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add custom fields like `id`
      email: string;
      name: string;
      image?: string;
      // Add any other custom fields you need
    } & DefaultSession["user"];
  }
}

// Extend the default JWT type
declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string; // Add custom fields like `id`
      email: string;
      name: string;
      image?: string;
      // Add any other custom fields you need
    };
  }
}