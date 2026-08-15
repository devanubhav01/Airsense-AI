import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { adminAuth } from "@/lib/firebase-admin";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        CredentialsProvider({
            id: "firebase",
            name: "Firebase",
            credentials: {
                idToken: { label: "ID Token", type: "text" },
            },
            async authorize(credentials) {
                try {
                    const decoded = await adminAuth.verifyIdToken(credentials.idToken);
                    await dbConnect();

                    let dbUser = await User.findOne(
                        decoded.phone_number
                            ? { phone: decoded.phone_number }
                            : { email: decoded.email }
                    );

                    if (!dbUser) {
                        dbUser = await User.create({
                            name: decoded.name || decoded.phone_number || decoded.email || "User",
                            email: decoded.email || undefined,
                            phone: decoded.phone_number || undefined,
                            authProvider: decoded.phone_number ? "phone" : "email",
                        });
                    }

                    return {
                        id: dbUser._id.toString(),
                        name: dbUser.name,
                        email: dbUser.email,
                        phone: dbUser.phone,
                    };
                } catch (err) {
                    console.error("Firebase token verification failed:", err);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account.provider === "firebase") return true; // already handled in authorize()
            await dbConnect();
            const existingUser = await User.findOne({ email: user.email });
            if (!existingUser) {
                await User.create({
                    name: user.name,
                    email: user.email,
                    authProvider: account.provider,
                });
            }
            return true;
        },
        async session({ session, token }) {
            await dbConnect();
            const dbUser = await User.findOne(
                token.email ? { email: token.email } : { phone: token.phone }
            );
            if (dbUser) {
                session.user.id = dbUser._id.toString();
                session.user.phone = dbUser.phone;
                session.user.age = dbUser.age;
                session.user.state = dbUser.state;
                session.user.city = dbUser.city;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.email = user.email;
                token.phone = user.phone;
            }
            return token;
        },
    },
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };