import { AQI_BANDS } from "@/lib/data";
import { describeArc } from "@/lib/aqi-helpers";

export default function Gauge({ value, size = "w-full" }) {
    const cx = 100, cy = 100, r = 80, sw = 14;
    const breakpoints = [0, 50, 100, 200, 300, 500];
    const clamped = Math.min(Math.max(value, 0), 500);
    const needleAngle = 180 + (clamped / 500) * 180;
    const needleRad = (needleAngle * Math.PI) / 180;
    const nr = r - sw / 2 - 8;
    const nx = cx + nr * Math.cos(needleRad);
    const ny = cy + nr * Math.sin(needleRad);

    return (
        <svg viewBox="0 0 200 112" className={size}>
            {breakpoints.slice(0, -1).map((bp, i) => {
                const a0 = 180 + (bp / 500) * 180;
                const a1 = 180 + (breakpoints[i + 1] / 500) * 180;
                return (
                    <path
                        key={i}
                        d={describeArc(cx, cy, r, a0, a1)}
                        fill="none"
                        stroke={AQI_BANDS[i].hex}
                        strokeWidth={sw}
                        strokeLinecap={i === 0 || i === breakpoints.length - 2 ? "round" : "butt"}
                    />
                );
            })}
            <circle cx={cx} cy={cy} r={4} fill="#1E293B" />
            <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#1E293B" strokeWidth={3} strokeLinecap="round" />
        </svg>
    );
}