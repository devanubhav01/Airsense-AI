"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, CheckCircle2, Smartphone, CreditCard, Building2, Loader2, ShieldCheck } from "lucide-react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Field, { inputCls } from "@/components/Field";

export default function ReportPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [payEmail, setPayEmail] = useState("you@example.com");
    const [method, setMethod] = useState("upi");
    const [paying, setPaying] = useState(false);

    function pay() {
        setPaying(true);
        setTimeout(() => { setPaying(false); setStep(4); }, 1400);
    }

    const included = ["7-day AQI forecast", "Full pollutant analysis", "Personalised health recommendations", "30-day historical trends"];

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-5 py-16">
            <Card className="w-full max-w-md">
                {step < 4 && (
                    <div className="mb-6 flex items-center gap-2">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-2 flex-1">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${step >= s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>{s}</div>
                                {s < 3 && <div className="h-px flex-1 bg-slate-200" />}
                            </div>
                        ))}
                    </div>
                )}

                {step === 1 && (
                    <>
                        <div className="relative mb-4 flex h-32 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                            <FileText size={32} className="text-slate-300" />
                            <span className="absolute rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">Preview locked</span>
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Your report includes</h2>
                        <ul className="mt-3 space-y-2">
                            {included.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 size={14} className="text-indigo-600" /> {item}</li>
                            ))}
                        </ul>
                        <Button variant="primary" className="mt-5 w-full" onClick={() => setStep(2)}>Unlock Full Report</Button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Confirm delivery email</h2>
                        <p className="mt-1 text-sm text-slate-500">We'll send the report here once payment is complete.</p>
                        <Field label="Email"><input value={payEmail} onChange={(e) => setPayEmail(e.target.value)} className={`${inputCls} mt-4`} /></Field>
                        <Button variant="primary" className="mt-5 w-full" onClick={() => setStep(3)}>Proceed to Payment</Button>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Payment</h2>
                        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div>
                                <div className="text-sm font-medium text-slate-800">7-Day Forecast Report</div>
                                <div className="text-xs text-slate-500">One-time purchase</div>
                            </div>
                            <div className="text-xl font-semibold text-slate-900" style={{ fontFamily: "'JetBrains Mono', monospace" }}>₹49</div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                            {[{ k: "upi", l: "UPI", icon: Smartphone }, { k: "card", l: "Card", icon: CreditCard }, { k: "netbanking", l: "Netbanking", icon: Building2 }].map((m) => (
                                <button key={m.k} onClick={() => setMethod(m.k)} className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-colors ${method === m.k ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-slate-200 text-slate-500"}`}>
                                    <m.icon size={16} /> {m.l}
                                </button>
                            ))}
                        </div>
                        <Button variant="primary" className="mt-5 w-full" onClick={pay} disabled={paying}>
                            {paying ? <><Loader2 size={15} className="animate-spin" /> Processing</> : <>Pay ₹49 & Get Report</>}
                        </Button>
                        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500"><ShieldCheck size={12} /> Secure Payment</p>
                    </>
                )}

                {step === 4 && (
                    <div className="text-center">
                        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={30} /></span>
                        <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Payment successful!</h2>
                        <p className="mt-1 text-sm text-slate-500">Report sent to {payEmail}</p>
                        <div className="mx-auto mt-4 w-fit rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            Order ID: ASA-{Math.floor(100000 + Math.random() * 900000)}
                        </div>
                        <Button variant="primary" className="mt-6 w-full" onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
                    </div>
                )}
            </Card>
        </div>
    );
}