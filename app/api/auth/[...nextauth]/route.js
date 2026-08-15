import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import OtpVerification from "@/models/OtpVerification";

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
            id: "email-otp",
            name: "Email OTP",
            credentials: {
                email: { label: "Email", type: "text" },
                otp: { label: "OTP", type: "text" },
            },
            async authorize(credentials) {
                try {
                    await dbConnect();
                    const record = await OtpVerification.findOne({ email: credentials.email });

                    if (!record || record.otp !== credentials.otp) return null;
                    if (record.expiresAt < new Date()) return null;

                    await OtpVerification.deleteOne({ _id: record._id });

                    let dbUser = await User.findOne({ email: credentials.email });
                    if (!dbUser) {
                        dbUser = await User.create({
                            name: credentials.email,
                            email: credentials.email,
                            authProvider: "email-otp",
                        });
                    }
                    return { id: dbUser._id.toString(), name: dbUser.name, email: dbUser.email, phone: dbUser.phone };
                } catch (err) {
                    console.error("email-otp authorize failed:", err);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account.provider === "email-otp") return true;
            await dbConnect();
            const existingUser = await User.findOne({ email: user.email });
            if (!existingUser) {
                await User.create({ name: user.name, email: user.email, authProvider: account.provider });
            }
            return true;
        },
        async session({ session, token }) {
            await dbConnect();
            const dbUser = await User.findOne({ email: token.email });
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
            }
            return token;
        },
    },
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };