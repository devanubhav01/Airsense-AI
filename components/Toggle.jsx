export default function Toggle({ checked, onChange }) {
    return (
        <button onClick={() => onChange(!checked)} className={`h-6 w-11 flex-shrink-0 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-slate-200"}`}>
            <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
    );
}