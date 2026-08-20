
"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { getBand } from "@/lib/data";

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const csv = useMemo(() => {
    if (!data?.rows?.length) return "";
    const headers = ["City", "AQI", "Tomorrow", "PM2.5", "PM10", "Humidity", "Wind", "Trend", "Status"];
    const lines = data.rows.map((r) => [r.name, r.aqi ?? "", r.tomorrow ?? "", r.pm25 ?? "", r.pm10 ?? "", r.humidity ?? "", r.windSpeed ?? "", r.trend, r.status]
      .map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","));
    return [headers.join(","), ...lines].join("\\n");
  }, [data]);

  function downloadCSV() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "airsense-government-analytics.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl bg-slate-50 px-5 py-10 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-indigo-600" /><h1 className="text-2xl font-semibold text-slate-900">Government Analytics</h1></div>
          <p className="mt-1 text-sm text-slate-500">City-level operational intelligence for prioritising air-quality interventions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={load}><RefreshCw size={14} /> Refresh</Button>
          <Button variant="primary" onClick={downloadCSV} disabled={!csv}><Download size={14} /> Export CSV</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><Loader2 size={18} className="animate-spin text-slate-500" /></div>
      ) : data ? (
        <>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            <Card><div className="text-xs uppercase tracking-wide text-slate-500">Cities tracked</div><div className="mt-2 text-4xl font-semibold text-slate-900">{data.summary.trackedCities}</div></Card>
            <Card><div className="text-xs uppercase tracking-wide text-slate-500">Average live AQI</div><div className="mt-2 text-4xl font-semibold text-slate-900">{data.summary.averageAQI ?? "—"}</div></Card>
            <Card><div className="text-xs uppercase tracking-wide text-slate-500">Severe cities</div><div className="mt-2 text-4xl font-semibold text-red-600">{data.summary.severeCities}</div></Card>
          </div>

          <Card className="mt-6 overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  {["City", "AQI", "Tomorrow", "PM2.5", "PM10", "Humidity", "Wind", "Trend", "Status"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
                </tr></thead>
                <tbody>{data.rows.map((r) => {
                  const band = r.aqi == null ? null : getBand(r.aqi);
                  return <tr key={r.name} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                    <td className={`px-4 py-3 font-semibold ${band?.text || "text-slate-400"}`}>{r.aqi ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{r.tomorrow ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{r.pm25 ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{r.pm10 ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{r.humidity ?? "—"}%</td>
                    <td className="px-4 py-3 text-slate-600">{r.windSpeed ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{r.trend}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.status}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          </Card>
          <p className="mt-3 text-xs text-slate-400">Data: WAQI ground-station network + Open-Meteo weather. Last generated: {new Date(data.generatedAt).toLocaleString()}</p>
        </>
      ) : (
        <p className="mt-10 text-sm text-red-500">Analytics could not be loaded.</p>
      )}
    </div>
  );
}
