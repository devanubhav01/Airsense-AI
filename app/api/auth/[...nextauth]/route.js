import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

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
    ],
    callbacks: {
        async signIn({ user, account }) {
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
        async session({ session }) {
            await dbConnect();
            const dbUser = await User.findOne({ email: session.user.email });
            if (dbUser) {
                session.user.id = dbUser._id.toString();
                session.user.age = dbUser.age;
                session.user.state = dbUser.state;
                session.user.city = dbUser.city;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };