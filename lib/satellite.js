import { getBounds } from "@/lib/geo";

const GIBS_WMS_URL = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";
const SATELLITE_LAYER = "MODIS_Terra_Aerosol_Optical_Depth_3km";

// We deliberately keep a known older date as the final fallback.
// GIBS publishes imagery with a delay, so an older image is preferable to
// an empty dashboard card.
const FALLBACK_DATE = "2026-08-18";

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

export function getSatelliteImageUrl(cityName) {
  return buildSatelliteUrl(cityName, FALLBACK_DATE);
}

function isoDateDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function urlLooksLikeRealImage(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return false;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) return false;

    // Do not reject a small-but-valid GIBS tile. The previous >2000-byte
    // check was too aggressive and caused valid fallback images to disappear.
    const buf = await res.arrayBuffer();
    return buf.byteLength > 300;
  } catch {
    return false;
  }
}

/**
 * Try recent GIBS dates first, then older dates. If GIBS cannot be reached
 * at all, still return a deterministic historical NASA URL so the dashboard
 * has a stable image source instead of an empty card.
 */
export async function resolveSatelliteImage(cityName) {
  const candidateDates = [
    0, 1, 2, 3, 4, 5, 7, 10, 14, 21, 30,
  ].map(isoDateDaysAgo);

  // Always include the known historical fallback date.
  candidateDates.push(FALLBACK_DATE);

  const seen = new Set();

  for (const dateStr of candidateDates) {
    if (seen.has(dateStr)) continue;
    seen.add(dateStr);

    const url = buildSatelliteUrl(cityName, dateStr);
    if (await urlLooksLikeRealImage(url)) {
      return {
        url,
        date: dateStr,
        source: "NASA GIBS · MODIS Terra Aerosol Optical Depth · cached",
        status: "cached",
      };
    }
  }

  return {
    url: buildSatelliteUrl(cityName, FALLBACK_DATE),
    date: FALLBACK_DATE,
    source: "NASA GIBS · MODIS Terra Aerosol Optical Depth · fallback",
    status: "fallback",
  };
}
