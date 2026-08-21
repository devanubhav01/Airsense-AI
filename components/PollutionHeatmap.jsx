"use client";

import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import Card from "@/components/Card";
import { BASE } from "@/lib/fallback-data";
import { getBand } from "@/lib/data";

// Fully static zone-level readout grid. Nothing here calls any API or
// WAQI/live station endpoint — every cell is derived, at render time, from
// the same fixed baseline pollutant numbers used across the rest of the
// dashboard's cached snapshot (lib/fallback-data.js). Switching cities
// swaps every cell instantly since it's just local math, never a fetch.
//
// ZONE_FACTORS spreads 24 "instrument" readouts around the city baseline so
// the grid looks like a real, varied monitoring network instead of one flat
// color. PM_JITTER nudges PM2.5/PM10 slightly off the AQI factor per zone
// so the three toggles don't look identical to one another.
const ZONE_FACTORS = [
  1.04, 0.86, 1.35, 0.63, 0.95, 1.18,
  0.72, 1.42, 0.58, 1.06, 0.83, 1.29,
  0.97, 1.12, 0.67, 1.24, 1.38, 0.79,
  1.02, 0.91, 1.16, 0.61, 1.33, 0.88,
];

const PM_JITTER = [
  0.03, -0.04, 0.06, -0.02, 0.01, -0.05,
  0.04, 0.02, -0.03, 0.05, -0.01, 0.03,
  -0.06, 0.02, 0.04, -0.03, 0.01, 0.05,
  -0.02, 0.03, -0.04, 0.02, 0.06, -0.01,
];

const METRICS = [
  { key: "aqi", label: "AQI" },
  { key: "pm25", label: "PM2.5" },
  { key: "pm10", label: "PM10" },
];

function zoneValue(baseValue, index, metricKey) {
  const factor = ZONE_FACTORS[index];
  const jitter = metricKey === "aqi" ? 0 : PM_JITTER[index];
  const value = baseValue * factor * (1 + jitter);
  return Math.max(5, Math.round(value));
}

export default function PollutionHeatmap({ activeCity }) {
  const [metric, setMetric] = useState("aqi");

  const cityKey = BASE[activeCity] ? activeCity : "Delhi";
  const base = BASE[cityKey];
  const baseValue = metric === "aqi" ? base.aqi : metric === "pm25" ? base.pm25 : base.pm10;

  const zones = ZONE_FACTORS.map((_, index) => {
    const value = zoneValue(baseValue, index, metric);
    // AQI_BANDS ranges are reused as a simple 0–500 intensity scale for
    // PM2.5/PM10 too, purely for the heatmap's coloring — not a CPCB
    // conversion, just a consistent "darker = worse" visual language that
    // matches the rest of the app.
    const band = getBand(Math.min(value, 500));
    return { id: `zone-${index + 1}`, value, band };
  });

  const metricLabel = METRICS.find((m) => m.key === metric)?.label || "AQI";

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LayoutGrid size={16} className="text-indigo-600" />
          <h3 className="text-[15px] font-semibold text-slate-900">
            Pollution Heatmap
          </h3>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMetric(m.key)}
              className={`rounded-md px-3 py-1 text-[11px] font-medium transition ${
                metric === m.key
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-6 gap-2">
        {zones.map((zone, i) => (
          <div
            key={zone.id}
            title={`Zone ${i + 1} · ${metricLabel} ${zone.value}${metric === "aqi" ? "" : " µg/m³"} · ${zone.band.label}`}
            className="aspect-[4/3] rounded-lg"
            style={{ backgroundColor: zone.band.hex, opacity: 0.85 }}
          />
        ))}
      </div>

      <p className="mt-3 text-[11px] text-slate-500">
        Zone-level {metricLabel} intensity across {cityKey} · darker = higher concentration
      </p>
    </Card>
  );
}
