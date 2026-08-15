export default function SpectrumRibbon({ value, className = "" }) {
    const pct = (Math.min(Math.max(value, 0), 500) / 500) * 100;
    return (
        <div
            className={`relative h-1.5 rounded-full overflow-hidden ${className}`}
            style={{ backgroundImage: "linear-gradient(to right, #10B981, #F59E0B, #F97316, #EF4444, #7F1D1D)" }}
        >
            {value !== undefined && (
                <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-slate-900 ring-2 ring-white shadow"
                    style={{ left: `${pct}%` }}
                />
            )}
        </div>
    );
}