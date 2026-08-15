"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ChevronRight, Search, TrendingUp, MapPin, Bell, FileText } from "lucide-react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Gauge from "@/components/Gauge";
import SpectrumRibbon from "@/components/SpectrumRibbon";
import { useAuth } from "@/components/AuthContext";
import { CITIES, getBand } from "@/lib/data";

export default function LandingPage() {
  const router = useRouter();
  const { setLoggedIn } = useAuth();
  const [city, setCity] = useState("Delhi");
  const cityData = CITIES.find((c) => c.name === city);
  const band = getBand(cityData.aqi);

  const features = [
    { icon: TrendingUp, title: "AQI Forecasting", desc: "7-day predictive readouts modeled on meteorological + emissions data." },
    { icon: MapPin, title: "Pollution Heatmaps", desc: "Zone-level PM2.5/PM10 visualisation across your city, updated hourly." },
    { icon: Bell, title: "Smart Alerts", desc: "Threshold-based warnings the moment air quality tips into your risk band." },
    { icon: FileText, title: "Detailed Reports", desc: "Downloadable pollutant breakdowns with health guidance, on demand." },
  ];
  const steps = ["Sign Up", "Select City", "View Dashboard", "Download Report"];
  const stats = [
    { n: "50+", l: "Cities Tracked" },
    { n: "10,000+", l: "Users Alerted" },
    { n: "95%", l: "Forecast Accuracy" },
    { n: "24/7", l: "Live Monitoring" },
  ];

  function viewLive() {
    setLoggedIn(true);
    router.push("/dashboard");
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-indigo-50/60 via-white to-white">
        <div className="pointer-events-none absolute inset-0 opacity-70" style={{
          backgroundImage: "radial-gradient(circle at 15% 15%, rgba(79,70,229,0.08), transparent 40%), radial-gradient(circle at 85% 5%, rgba(16,185,129,0.10), transparent 40%)"
        }} />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              <Sparkles size={12} /> AI-powered · Updated hourly
            </span>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Predict air quality<br />before it affects you.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-500">
              AirSense AI reads pollution the way an instrument does — precise, forecasted, and colour-coded to how it actually feels to breathe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => router.push("/login")}>Get Started Free <ArrowRight size={15} /></Button>
              <Button variant="ghost" onClick={viewLive}>View Live AQI</Button>
            </div>
            <SpectrumRibbon value={cityData.aqi} className="mt-10 max-w-sm" />
            <div className="mt-2 flex max-w-sm justify-between text-[11px] text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span>0</span><span>100</span><span>200</span><span>300</span><span>500</span>
            </div>
          </div>

          <Card className="relative">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                <Search size={14} className="text-slate-400" />
                <select value={city} onChange={(e) => setCity(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none">
                  {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${band.bg} ${band.text}`}>{band.label}</span>
            </div>
            <Gauge value={cityData.aqi} />
            <div className="-mt-4 text-center">
              <div className={`text-5xl font-semibold ${band.text}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{cityData.aqi}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">Live AQI · {city}</div>
            </div>
            <Button variant="dark" className="mt-5 w-full" onClick={viewLive}>
              View Detailed Forecast <ChevronRight size={15} />
            </Button>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Built like an instrument panel</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-500">Four readouts that turn raw sensor data into decisions you can actually act on.</p>
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Card key={i} className="transition-colors hover:border-indigo-300 hover:shadow-md">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><f.icon size={18} /></span>
              <h3 className="text-[15px] font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>How it works</h2>
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="text-sm font-semibold text-indigo-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>0{i + 1}</div>
                <div className="mt-2 text-[15px] font-medium text-slate-900">{s}</div>
                {i < steps.length - 1 && <div className="absolute right-0 top-1.5 hidden h-px w-1/2 translate-x-1/2 bg-slate-300 lg:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center sm:text-left">
              <div className="text-4xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.n}</div>
              <div className="mt-1 text-sm text-slate-500">{s.l}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}