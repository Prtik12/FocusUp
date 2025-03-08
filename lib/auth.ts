// lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password.");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid email or password.");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // When the user object is available (e.g., at sign-in), attach the needed fields.
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        // If token exists, use its data.
        if (token && token.id) {
          session.user.id = token.id;
          session.user.email = token.email;
          session.user.name = token.name;
          session.user.image = token.image as string | null | undefined;
        } else if (user) {
          // Otherwise, fall back to the user object (database session).
          session.user.id = user.id;
          session.user.email = user.email;
          session.user.name = user.name;
          session.user.image = user.image;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  // Remove the JWT session strategy to force the use of database sessions.
  // This way, every call to /api/auth/session reads fresh data from your DB.
  // session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
