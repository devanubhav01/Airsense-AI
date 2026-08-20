"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BellRing, Loader2, MailCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import Card from "@/components/Card";
import Toggle from "@/components/Toggle";

export default function AlertsPage() {
  const { data: session, status } = useSession();
  const [toggles, setToggles] = useState({ daily: true, severe: true, weekly: false });
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/alerts?userId=${encodeURIComponent(session.user.id)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setToggles(json.data.preferences);
          setHistory(json.data.history || []);
        }
      })
      .catch(() => setMessage("Could not load notification preferences."))
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  async function updatePreference(key, value) {
    const next = { ...toggles, [key]: value };
    setToggles(next);
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, preferences: next }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Save failed");
      setMessage("Notification preference saved.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-slate-50"><Loader2 size={18} className="animate-spin text-slate-500" /></div>;
  }

  if (!session?.user?.id) {
    return <div className="mx-auto max-w-4xl px-5 py-16 text-center text-sm text-slate-500">Please log in to manage alerts.</div>;
  }

  const items = [
    { key: "daily", label: "Daily AQI Summary", desc: "Email every day with the latest reading for your saved city." },
    { key: "severe", label: "Severe Warnings", desc: "Email alert when AQI reaches the severe/hazardous band (200+)." },
    { key: "weekly", label: "Weekly Summary", desc: "Email digest with the upcoming 7-day forecast every Sunday." },
  ];

  return (
    <div className="mx-auto max-w-4xl bg-slate-50 px-5 py-10 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Smart Alerts</h1>
          <p className="mt-1 text-sm text-slate-500">Alerts are processed automatically by AirSense's scheduled monitoring job.</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600"><MailCheck size={12} /> Email enabled</span>
      </div>

      <Card className="mt-6">
        <div className="divide-y divide-slate-200">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800"><BellRing size={14} className="text-indigo-500" />{item.label}</div>
                <div className="mt-1 text-xs text-slate-500">{item.desc}</div>
              </div>
              <Toggle checked={toggles[item.key]} onChange={(v) => updatePreference(item.key, v)} />
            </div>
          ))}
        </div>
        {message && <p className="mt-4 text-xs text-slate-500">{saving ? "Saving…" : message}</p>}
      </Card>

      <h2 className="mt-9 text-sm font-semibold uppercase tracking-wide text-slate-500">Real Alert History</h2>
      <div className="mt-4 space-y-3">
        {history.length ? history.slice().reverse().map((a, i) => (
          <div key={`${a.createdAt}-${i}`} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500"><AlertTriangle size={15} /></span>
            <div>
              <div className="flex items-center gap-2"><span className="text-sm font-medium text-slate-800">{a.type} alert</span><span className="text-xs text-slate-400">· {a.city}</span></div>
              <p className="mt-0.5 text-xs text-slate-500">{a.message}</p>
              <p className="mt-1 text-[10px] text-slate-400">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}</p>
            </div>
          </div>
        )) : (
          <Card><p className="text-sm text-slate-500">No automated alerts have been triggered yet.</p></Card>
        )}
      </div>
    </div>
  );
}
