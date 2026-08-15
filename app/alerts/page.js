"use client";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Card from "@/components/Card";
import Toggle from "@/components/Toggle";
import { ALERTS_HISTORY } from "@/lib/data";

export default function AlertsPage() {
    const [toggles, setToggles] = useState({ daily: true, severe: true, weekly: false });
    const items = [
        { key: "daily", label: "Daily AQI Summary", desc: "One notification each morning with today's reading." },
        { key: "severe", label: "Severe Warnings", desc: "Immediate alert when AQI crosses your risk threshold." },
        { key: "weekly", label: "Weekly Summary", desc: "A digest of trends every Sunday evening." },
    ];

    return (
        <div className="mx-auto max-w-4xl bg-slate-50 px-5 py-10 lg:px-8">
            <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Alerts</h1>
            <p className="mt-1 text-sm text-slate-500">Choose how AirSense AI should reach you.</p>

            <Card className="mt-6">
                <div className="divide-y divide-slate-200">
                    {items.map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                            <div>
                                <div className="text-sm font-medium text-slate-800">{item.label}</div>
                                <div className="text-xs text-slate-500">{item.desc}</div>
                            </div>
                            <Toggle checked={toggles[item.key]} onChange={(v) => setToggles((t) => ({ ...t, [item.key]: v }))} />
                        </div>
                    ))}
                </div>
            </Card>

            <h2 className="mt-9 text-sm font-semibold uppercase tracking-wide text-slate-500">History</h2>
            <div className="mt-4 space-y-3">
                {ALERTS_HISTORY.map((a, i) => (
                    <div key={i} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500"><AlertTriangle size={15} /></span>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-800">{a.type}</span>
                                <span className="text-xs text-slate-400">· {a.date}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500">{a.msg}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}