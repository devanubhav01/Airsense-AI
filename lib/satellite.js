import { getBounds } from "@/lib/geo";

const GIBS_WMS_URL = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";
const SATELLITE_LAYER = "MODIS_Terra_Aerosol_Optical_Depth";

function buildSatelliteUrl(cityName, dateStr) {
  const { lat1, lon1, lat2, lon2 } = getBounds(cityName);

  const params = new URLSearchParams({
    SERVICE: "WMS",
    REQUEST: "GetMap",
    VERSION: "1.1.1",
    LAYERS: SATELLITE_LAYER,
    STYLES: "",
    SRS: "EPSG:4326",
    BBOX: `${lon1},${lat1},${lon2},${lat2}`,
    WIDTH: "900",
    HEIGHT: "480",
    FORMAT: "image/png",
    TRANSPARENT: "false",
    TIME: dateStr,
  });

  return `${GIBS_WMS_URL}?${params.toString()}`;
}

// Kept for backward compatibility with any other caller that only needs the URL string.
export function getSatelliteImageUrl(cityName) {
  const date = new Date().toISOString().slice(0, 10);
  return buildSatelliteUrl(cityName, date);
}

function isoDateDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function urlLooksLikeRealImage(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return false;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return false;

    // GIBS returns a tiny/near-empty PNG (a few hundred bytes) when no
    // imagery exists for that date/tile. A real aerosol tile is much larger.
    const buf = await res.arrayBuffer();
    return buf.byteLength > 2000;
  } catch (err) {
    return false;
  }
}

/**
 * Resolves a usable NASA GIBS satellite image URL for the given city.
 * Same-day imagery is often not published yet (MODIS Terra passes take a
 * few hours to process), so we try today first and fall back to previous
 * days before giving up. The window is intentionally wide (10 days) so a
 * temporary GIBS gap for one city never leaves the panel empty — an older
 * tile is always preferred over nothing.
 *
 * Returns { url, date, source } — this now ALWAYS resolves to a usable
 * object, never null. If no day in the window passes the "looks like a
 * real image" check (e.g. GIBS itself is unreachable), it still returns
 * the most recent date's URL as a best-effort fallback so the <img> tag
 * always has something to try rendering. Never throws — callers can
 * safely `.catch()` around it, but it's written to resolve instead so it
 * can't crash a Promise.all.
 */
export async function resolveSatelliteImage(cityName) {
  const MAX_DAYS_BACK = 10;
  let fallback = null;

  for (let daysAgo = 0; daysAgo <= MAX_DAYS_BACK; daysAgo++) {
    const dateStr = isoDateDaysAgo(daysAgo);
    const url = buildSatelliteUrl(cityName, dateStr);

    if (!fallback) {
      // Keep the very first (most recent) URL as a last-resort fallback
      // in case nothing in the window passes validation.
      fallback = { url, date: dateStr, source: "NASA GIBS · MODIS Terra Aerosol Optical Depth" };
    }

    const ok = await urlLooksLikeRealImage(url);
    if (ok) {
      return {
        url,
        date: dateStr,
        source: "NASA GIBS · MODIS Terra Aerosol Optical Depth",
      };
    }
  }

  // Nothing validated (likely a network/CORS issue reaching GIBS from the
  // server) — still hand back a URL rather than null so the UI never has
  // to show an empty satellite panel.
  return fallback;
}
