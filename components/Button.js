export default function Button({ children, variant = "primary", className = "", ...props }) {
    const base = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-50";
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20",
        ghost: "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50",
        dark: "bg-slate-900 text-white hover:bg-slate-800",
        danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    };
    return (
        <button className={`${base} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}