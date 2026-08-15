"use client";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { Lock } from "lucide-react";
import { SiGoogle, SiGithub } from "@icons-pack/react-simple-icons";
import Card from "@/components/Card";

export default function LoginPage() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-5 py-16">
            <Card className="w-full max-w-md">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Lock size={18} /></span>
                <h2 className="text-xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Welcome to AirSense AI</h2>
                <p className="mt-1 text-sm text-slate-500">Sign in to continue.</p>

                <div className="mt-6 space-y-2.5">
                    <button
                        onClick={() => nextAuthSignIn("google", { callbackUrl: "/dashboard" })}
                        className="flex w-full items-center justify-center gap-2.5 rounded-full border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <SiGoogle size={16} color="#4285F4" />
                        Continue with Google
                    </button>
                    <button
                        onClick={() => nextAuthSignIn("github", { callbackUrl: "/dashboard" })}
                        className="flex w-full items-center justify-center gap-2.5 rounded-full border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <SiGithub size={16} color="#181717" />
                        Continue with GitHub
                    </button>
                </div>
            </Card>
        </div>
    );
}