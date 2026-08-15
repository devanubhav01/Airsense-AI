"use client";
import { SessionProvider, useSession, signOut } from "next-auth/react";

export function AuthProvider({ children }) {
    return <SessionProvider>{children}</SessionProvider>;
}

export function useAuth() {
    const { data: session, status } = useSession();
    return {
        loggedIn: status === "authenticated",
        loading: status === "loading",
        user: session?.user,
        signOut,
    };
}