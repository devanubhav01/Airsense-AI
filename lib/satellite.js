import { getBounds } from "@/lib/geo";

export function getSatelliteImageUrl(cityName) {
  const { lat1, lon1, lat2, lon2 } = getBounds(cityName);
  const date = new Date().toISOString().slice(0, 10);

  const params = new URLSearchParams({
    SERVICE: "WMS",
    REQUEST: "GetMap",
    VERSION: "1.1.1",
    LAYERS: "MODIS_Terra_Aerosol_Optical_Depth",
    STYLES: "",
    SRS: "EPSG:4326",
    BBOX: `${lon1},${lat1},${lon2},${lat2}`,
    WIDTH: "900",
    HEIGHT: "480",
    FORMAT: "image/png",
    TRANSPARENT: "false",
    TIME: date,
  });

  return `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?${params.toString()}`;
}
