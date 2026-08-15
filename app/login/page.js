"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { Lock, Mail } from "lucide-react";
import { SiGoogle, SiGithub } from "@icons-pack/react-simple-icons";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Field, { inputCls } from "@/components/Field";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState("choice"); // choice | email-input | email-otp
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [otpError, setOtpError] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        if (mode !== "email-otp" || timer <= 0) return;
        const t = setTimeout(() => setTimer((v) => v - 1), 1000);
        return () => clearTimeout(t);
    }, [mode, timer]);

    async function sendEmailOtp() {
        setOtpError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setOtpError(data.error || "Failed to send OTP.");
                setLoading(false);
                return;
            }
            setMode("email-otp");
            setTimer(30);
        } catch (err) {
            console.error(err);
            setOtpError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    function updateOtp(i, val) {
        if (!/^[0-9]?$/.test(val)) return;
        const next = [...otp];
        next[i] = val;
        setOtp(next);
        setOtpError("");
        if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
    }

    async function verifyEmailOtp() {
        const code = otp.join("");
        if (code.length < 6) { setOtpError("Enter all 6 digits."); return; }
        setLoading(true);
        try {
            const res = await nextAuthSignIn("email-otp", {
                email,
                otp: code,
                redirect: false,
            });

            if (res?.ok) {
                router.push("/dashboard");
            } else {
                setOtpError("Incorrect or expired code.");
            }
        } catch (err) {
            console.error(err);
            setOtpError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-5 py-16">
            <Card className="w-full max-w-md">
                {mode === "choice" && (
                    <>
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
                            <button
                                onClick={() => setMode("email-input")}
                                className="flex w-full items-center justify-center gap-2.5 rounded-full border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <Mail size={16} />
                                Continue with Email
                            </button>
                        </div>
                    </>
                )}

                {mode === "email-input" && (
                    <>
                        <h2 className="text-xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Enter your email</h2>
                        <p className="mt-1 text-sm text-slate-500">We'll send you a one-time code.</p>
                        <div className="mt-6">
                            <Field label="Email address">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className={inputCls}
                                />
                            </Field>
                            {otpError && <p className="mt-2 text-xs text-red-500">{otpError}</p>}
                            <Button variant="primary" className="mt-5 w-full" disabled={!email || loading} onClick={sendEmailOtp}>
                                {loading ? "Sending..." : "Send OTP"}
                            </Button>
                            <button onClick={() => setMode("choice")} className="mt-3 w-full text-center text-xs text-slate-500 hover:underline">
                                Back
                            </button>
                        </div>
                    </>
                )}

                {mode === "email-otp" && (
                    <>
                        <h2 className="text-xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Verify your email</h2>
                        <p className="mt-1 text-sm text-slate-500">OTP sent to <span className="text-slate-800">{email}</span></p>
                        <div className="mt-6 flex justify-between gap-2">
                            {otp.map((v, i) => (
                                <input
                                    key={i} id={`otp-${i}`} value={v} maxLength={1}
                                    onChange={(e) => updateOtp(i, e.target.value)}
                                    className={`h-12 w-11 rounded-lg border bg-white text-center text-lg font-semibold text-slate-900 outline-none focus:ring-1 ${otpError ? "border-red-400 focus:ring-red-400" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"}`}
                                />
                            ))}
                        </div>
                        {otpError && <p className="mt-2 text-xs text-red-500">{otpError}</p>}
                        <div className="mt-3 text-xs text-slate-500">
                            {timer > 0 ? `Resend OTP in 00:${String(timer).padStart(2, "0")}` : (
                                <button onClick={sendEmailOtp} className="text-indigo-600 hover:underline">Resend OTP</button>
                            )}
                        </div>
                        <Button variant="primary" className="mt-5 w-full" disabled={loading} onClick={verifyEmailOtp}>
                            {loading ? "Verifying..." : "Verify & Continue"}
                        </Button>
                    </>
                )}
            </Card>
        </div>
    );
}