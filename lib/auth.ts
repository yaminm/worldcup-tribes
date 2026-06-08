import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

const providers = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

// Dev-only credentials login. Lets us build/seed/test without Google creds.
// Never enable in production (guarded by ENABLE_DEV_LOGIN).
if (process.env.ENABLE_DEV_LOGIN === "true") {
  providers.push(
    Credentials({
      id: "dev-login",
      name: "Dev Login",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        if (!email) return null;
        const name =
          String(creds?.name ?? "").trim() || email.split("@")[0] || "Player";

        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email, name },
        });
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;
      // Resolve the current user id by email so a session never points at a
      // stale/deleted user row (which would cause FK errors on writes).
      let id = token.id as string | undefined;
      if (token.email) {
        const current = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true },
        });
        if (current) id = current.id;
      }
      if (id) session.user.id = id;
      return session;
    },
  },
});
