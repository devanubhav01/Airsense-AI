"use client";

import { Radio, Satellite } from "lucide-react";
import Card from "@/components/Card";

// Bundled satellite imagery — shown immediately, no network fetch, no
// loading state. The dashboard should never render an empty/broken card
// while waiting on a live NASA GIBS response, so these local images are
// the primary (not fallback) source. Path: public/satellite/*.png
const SATELLITE_CITIES = [
  { name: "Delhi", src: "/satellite/delhi.png" },
  { name: "Mumbai", src: "/satellite/mumbai.png" },
  { name: "Bengaluru", src: "/satellite/bengaluru.png" },
  { name: "Kolkata", src: "/satellite/kolkata.png" },
  { name: "Chennai", src: "/satellite/chennai.png" },
  { name: "Greater Noida", src: "/satellite/greater-noida.png" },
];

function SatelliteTile({ city, src, active }) {
  return (
    <div className={`group overflow-hidden rounded-2xl border bg-slate-950 shadow-sm ${active ? "border-indigo-400 ring-2 ring-indigo-200" : "border-slate-200"}`}>
      <div className="relative aspect-[16/8] overflow-hidden">
        <img
          src={src}
          alt={`${city} aerosol satellite context`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
        />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-slate-950/70 to-transparent px-3 py-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-white drop-shadow">
            {city}
            {active && <span className="rounded-full bg-indigo-500/90 px-1.5 py-0.5 text-[8px] font-medium">Selected</span>}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-1 text-[9px] font-medium text-emerald-100 backdrop-blur-md">
            <Radio size={10} className="animate-pulse" />
            Latest available
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent px-3 pb-2 pt-8">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-200">
            <Satellite size={10} />
            NASA MODIS Terra · aerosol optical depth
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-slate-950 px-3 py-2">
        <span className="text-[9px] text-slate-400">GIBS imagery · aerosol optical depth layer</span>
        <span className="shrink-0 text-[9px] text-slate-500">Latest pass</span>
      </div>
    </div>
  );
}

export default function SatelliteCityGrid({ activeCity }) {
  // Surface the currently selected city's imagery first so the panel feels
  // tied to whatever the user has picked on the dashboard.
  const ordered = activeCity
    ? [...SATELLITE_CITIES].sort((a, b) => (a.name === activeCity ? -1 : b.name === activeCity ? 1 : 0))
    : SATELLITE_CITIES;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Satellite size={16} className="text-indigo-600" />
            <h3 className="text-[15px] font-semibold text-slate-900">
              Satellite Aerosol Context
            </h3>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            NASA MODIS Terra aerosol optical depth · city-wise satellite context
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-600">
          <Radio size={10} className="animate-pulse" />
          {SATELLITE_CITIES.length}/{SATELLITE_CITIES.length} latest sources loaded
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {ordered.map((c) => (
          <SatelliteTile key={c.name} city={c.name} src={c.src} active={c.name === activeCity} />
        ))}
      </div>
    </Card>
  );
}
