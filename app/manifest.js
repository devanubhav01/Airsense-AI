export default function manifest() {
  return {
    name: "AirSense AI",
    short_name: "AirSense AI",
    description: "Predictive air-quality intelligence for Indian cities.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#4f46e5",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
    ],
  };
}
