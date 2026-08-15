"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LogOut } from "lucide-react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Field, { inputCls } from "@/components/Field";
import { useAuth } from "@/components/AuthContext";
import { STATE_CITY_MAP, REPORTS_HISTORY } from "@/lib/data";

export default function AccountPage() {
    const router = useRouter();
    const { setLoggedIn } = useAuth();
    const [name, setName] = useState("Anubhav Singh");
    const [email] = useState("anubhav@example.com");
    const [age, setAge] = useState("20");
    const [state, setState] = useState("Delhi");
    const [profileCity, setProfileCity] = useState("New Delhi");

    function logout() {
        setLoggedIn(false);
        router.push("/");
    }

    return (
        <div className="mx-auto max-w-4xl bg-slate-50 px-5 py-10 lg:px-8">
            <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>My Account</h1>

            <Card className="mt-6">
                <h3 className="mb-4 text-[15px] font-semibold text-slate-900">Profile details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
                    <Field label="Email"><input value={email} readOnly className={`${inputCls} cursor-not-allowed bg-slate-50 opacity-70`} /></Field>
                    <Field label="Age"><input value={age} onChange={(e) => setAge(e.target.value)} type="number" className={inputCls} /></Field>
                    <Field label="State">
                        <select value={state} onChange={(e) => setState(e.target.value)} className={inputCls}>
                            {Object.keys(STATE_CITY_MAP).map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </Field>
                    <Field label="City">
                        <select value={profileCity} onChange={(e) => setProfileCity(e.target.value)} className={inputCls}>
                            {(STATE_CITY_MAP[state] || []).map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </Field>
                </div>
                <Button variant="primary" className="mt-5">Save Changes</Button>
            </Card>

            <h2 className="mt-9 text-sm font-semibold uppercase tracking-wide text-slate-500">My Reports</h2>
            <Card className="mt-4 overflow-hidden !p-0">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                            <th className="px-5 py-3 font-medium">Date</th>
                            <th className="px-5 py-3 font-medium">Report Type</th>
                            <th className="px-5 py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {REPORTS_HISTORY.map((r, i) => (
                            <tr key={i} className="border-b border-slate-100 last:border-0">
                                <td className="px-5 py-3 text-slate-500">{r.date}</td>
                                <td className="px-5 py-3 text-slate-800">{r.type}</td>
                                <td className="px-5 py-3">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600">
                                        <CheckCircle2 size={11} /> {r.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Button variant="danger" className="mt-8" onClick={logout}>
                <LogOut size={14} /> Logout
            </Button>
        </div>
    );
}