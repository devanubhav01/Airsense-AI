"use client";

import { useEffect, useMemo, useState } from "react";
import { Radio, Satellite, Clock3 } from "lucide-react";
import Card from "@/components/Card";

const SATELLITE_CITIES = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Kolkata",
  "Chennai",
];

const FALLBACK_IMAGES = {
  Delhi: "/satellite-fallback/Delhi.svg",
  Mumbai: "/satellite-fallback/Mumbai.svg",
  Bengaluru: "/satellite-fallback/Bengaluru.svg",
  Kolkata: "/satellite-fallback/Kolkata.svg",
  Chennai: "/satellite-fallback/Chennai.svg",
};

function SatelliteTile({ city, remoteUrl, remoteDate, onFallback }) {
  const fallback = FALLBACK_IMAGES[city];
  const [src, setSrc] = useState(remoteUrl || fallback);
  const [usingFallback, setUsingFallback] = useState(!remoteUrl);

  useEffect(() => {
    if (remoteUrl) {
      setSrc(remoteUrl);
      setUsingFallback(false);
    } else {
      setSrc(fallback);
      setUsingFallback(true);
    }
  }, [remoteUrl, fallback]);

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
      <div className="relative aspect-[16/8] overflow-hidden">
        <img
          src={src}
          alt={`${city} aerosol satellite context`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          loading="lazy"
          onError={() => {
            if (!usingFallback) {
              setSrc(fallback);
              setUsingFallback(true);
              onFallback?.(city);
            }
          }}
        />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-slate-950/70 to-transparent px-3 py-3">
          <span className="text-sm font-semibold text-white drop-shadow">
            {city}
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-medium backdrop-blur-md ${
              usingFallback
                ? "bg-white/15 text-white"
                : "bg-emerald-400/20 text-emerald-100"
            }`}
          >
            {usingFallback ? (
              <Clock3 size={10} />
            ) : (
              <Radio size={10} className="animate-pulse" />
            )}
            {usingFallback ? "Historical fallback" : "Latest available"}
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
        <span className="text-[9px] text-slate-400">
          {usingFallback
            ? "Local visual fallback · shown until live imagery loads"
            : "GIBS imagery · latest image returned by the service"}
        </span>
        <span className="shrink-0 text-[9px] text-slate-500">
          {remoteDate || "fallback"}
        </span>
      </div>
    </div>
  );
}

export default function SatelliteCityGrid() {
  const [remoteData, setRemoteData] = useState({});
  const [failedCities, setFailedCities] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function loadSatelliteData() {
      const results = await Promise.allSettled(
        SATELLITE_CITIES.map(async (city) => {
          const response = await fetch(`/api/satellite/${encodeURIComponent(city)}`, {
            cache: "no-store",
          });

          if (!response.ok) {
            throw new Error(`Satellite request failed for ${city}`);
          }

          const json = await response.json();
          if (!json?.url) {
            throw new Error(`No satellite image for ${city}`);
          }

          return {
            city,
            url: json.url,
            date: json.date || "latest",
          };
        })
      );

      if (cancelled) return;

      const next = {};
      for (const result of results) {
        if (result.status === "fulfilled") {
          next[result.value.city] = {
            url: result.value.url,
            date: result.value.date,
          };
        }
      }

      setRemoteData(next);
      setFailedCities({});
    }

    loadSatelliteData();

    return () => {
      cancelled = true;
    };
  }, []);

  const liveCount = useMemo(
    () =>
      Object.keys(remoteData).filter(
        (city) => !failedCities[city]
      ).length,
    [remoteData, failedCities]
  );

  return (
    <Card className="mt-6 overflow-hidden">
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
          <Radio size={10} className={liveCount ? "animate-pulse" : ""} />
          {liveCount}/{SATELLITE_CITIES.length} latest sources loaded
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SATELLITE_CITIES.map((city) => (
          <SatelliteTile
            key={city}
            city={city}
            remoteUrl={failedCities[city] ? undefined : remoteData[city]?.url}
            remoteDate={failedCities[city] ? undefined : remoteData[city]?.date}
            onFallback={(failedCity) =>
              setFailedCities((current) => ({
                ...current,
                [failedCity]: true,
              }))
            }
          />
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5 text-[10px] leading-relaxed text-slate-500">
        Local visual fallbacks are bundled, so the dashboard never
        shows an empty satellite panel. When the NASA/GIBS image request
        succeeds, the corresponding city tile automatically switches to it.
      </div>
    </Card>
  );
}
