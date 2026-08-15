"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock } from "lucide-react";
import { SiGoogle, SiGithub } from "@icons-pack/react-simple-icons";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Field, { inputCls } from "@/components/Field";
import { STATE_CITY_MAP } from "@/lib/data";

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [otpError, setOtpError] = useState(false);
    const [timer, setTimer] = useState(30);
    const [state, setState] = useState("");
    const [profileCity, setProfileCity] = useState("");

    useEffect(() => {
        if (step !== 2 || timer <= 0) return;
        const t = setTimeout(() => setTimer((v) => v - 1), 1000);
        return () => clearTimeout(t);
    }, [step, timer]);

    function updateOtp(i, val) {
        if (!/^[0-9]?$/.test(val)) return;
        const next = [...otp];
        next[i] = val;
        setOtp(next);
        setOtpError(false);
        if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
    }

    function verifyOtp() {
        if (otp.join("").length < 6) { setOtpError(true); return; }
        setStep(3);
    }

    function completeProfile() {
        // TODO: email/OTP flow abhi Firebase se real nahi hua (Part E mein karenge).
        // Filhaal ye sirf UI demo hai — real login Google/GitHub se hi ho raha hai.
        router.push("/dashboard");
    }

    const progress = ["Verify", "Confirm", "Profile"];

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-5 py-16">
            <Card className="w-full max-w-md">
                {step === 3 && (
                    <div className="mb-6 flex items-center gap-2">
                        {progress.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 flex-1">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${i <= 2 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>{i + 1}</div>
                                {i < progress.length - 1 && <div className="h-px flex-1 bg-slate-200" />}
                            </div>
                        ))}
                    </div>
                )}

                {step === 1 && (
                    <>
                        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Lock size={18} /></span>
                        <h2 className="text-xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Welcome to AirSense AI</h2>
                        <p className="mt-1 text-sm text-slate-500">Sign in to continue.</p>

                        <div className="mt-6 space-y-2.5">
                            <button
                                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                                className="flex w-full items-center justify-center gap-2.5 rounded-full border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <SiGoogle size={16} color="#4285F4" />
                                Continue with Google
                            </button>
                            <button
                                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                                className="flex w-full items-center justify-center gap-2.5 rounded-full border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <SiGithub size={16} color="#181717" />
                                Continue with GitHub
                            </button>
                        </div>

                        <div className="my-5 flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="text-xs text-slate-400">or continue with email</span>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>

                        <div>
                            <Field label="Email address">
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
                            </Field>
                            <Button variant="primary" className="mt-5 w-full" disabled={!email.includes("@")} onClick={() => setStep(2)}>Send OTP</Button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className="text-xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Verify your email</h2>
                        <p className="mt-1 text-sm text-slate-500">OTP sent to <span className="text-slate-800">{email || "you@example.com"}</span></p>
                        <div className="mt-6 flex justify-between gap-2">
                            {otp.map((v, i) => (
                                <input
                                    key={i} id={`otp-${i}`} value={v} maxLength={1}
                                    onChange={(e) => updateOtp(i, e.target.value)}
                                    className={`h-12 w-11 rounded-lg border bg-white text-center text-lg font-semibold text-slate-900 outline-none focus:ring-1 ${otpError ? "border-red-400 focus:ring-red-400" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"}`}
                                />
                            ))}
                        </div>
                        {otpError && <p className="mt-2 text-xs text-red-500">Incorrect code. Check the digits and try again.</p>}
                        <div className="mt-3 text-xs text-slate-500">
                            {timer > 0 ? `Resend OTP in 00:${String(timer).padStart(2, "0")}` : (
                                <button onClick={() => setTimer(30)} className="text-indigo-600 hover:underline">Resend OTP</button>
                            )}
                        </div>
                        <Button variant="primary" className="mt-5 w-full" onClick={verifyOtp}>Verify & Continue</Button>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h2 className="text-xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Complete your profile</h2>
                        <p className="mt-1 text-sm text-slate-500">One-time setup so we can tailor forecasts to you.</p>
                        <div className="mt-6 space-y-4">
                            <Field label="Full name"><input className={inputCls} placeholder="Anubhav Singh" /></Field>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Age"><input type="number" className={inputCls} placeholder="20" /></Field>
                                <Field label="Email">
                                    <input className={`${inputCls} cursor-not-allowed bg-slate-50 opacity-70`} value={email || "you@example.com"} readOnly />
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="State">
                                    <select value={state} onChange={(e) => { setState(e.target.value); setProfileCity(""); }} className={inputCls}>
                                        <option value="">Select state</option>
                                        {Object.keys(STATE_CITY_MAP).map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </Field>
                                <Field label="City">
                                    <select value={profileCity} onChange={(e) => setProfileCity(e.target.value)} disabled={!state} className={`${inputCls} disabled:opacity-50`}>
                                        <option value="">Select city</option>
                                        {(STATE_CITY_MAP[state] || []).map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>
                            </div>
                            <Button variant="primary" className="w-full" disabled={!state || !profileCity} onClick={completeProfile}>
                                Complete Profile & Continue
                            </Button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}