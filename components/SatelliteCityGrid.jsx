"use client";

import { Satellite, ImageOff } from "lucide-react";
import Card from "@/components/Card";


const SATELLITE_CITIES = {
  "Delhi": "/satellite/delhi.png",
  "Mumbai": "/satellite/mumbai.png",
  "Bengaluru": "/satellite/bengaluru.png",
  "Kolkata": "/satellite/kolkata.png",
  "Chennai": "/satellite/chennai.png",
  "Greater Noida": "/satellite/greater-noida.png",
};

const CITY_ORDER = Object.keys(SATELLITE_CITIES);

export default function SatelliteCityGrid({ activeCity }) {
  const cityName = SATELLITE_CITIES[activeCity] ? activeCity : CITY_ORDER[0];
  const src = SATELLITE_CITIES[cityName];

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
            NASA MODIS Terra aerosol optical depth · GIBS
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-600">
          Latest imagery
        </span>
      </div>

      {/* Single image tied to whichever city is currently selected on the
          dashboard. No fetch, no loading state, no live data source. */}
      <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
        <div className="relative aspect-[16/9] w-full">
          <img
            key={cityName}
            src={src}
            alt={`${cityName} aerosol satellite context`}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.style.display = "flex";
            }}
          />

          <div
            className="absolute inset-0 hidden flex-col items-center justify-center gap-2 bg-slate-900 text-slate-400"
            style={{ display: "none" }}
          >
            <ImageOff size={22} />
            <span className="text-xs">Image unavailable for {cityName}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500">
          Latest available satellite snapshot for this city
        </span>
        <span className="shrink-0 text-[11px] font-medium text-slate-600">{cityName}</span>
      </div>
    </Card>
  );
}
