export const inputCls = "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors";

export default function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {label}
            </span>
            {children}
        </label>
    );
}