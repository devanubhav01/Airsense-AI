import { SiGithub, SiX, SiLinkedin, SiInstagram } from "@icons-pack/react-simple-icons";
import { Leaf } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-slate-800 bg-slate-900">
            <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
                <div className="grid gap-10 md:grid-cols-4">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400"><Leaf size={15} /></span>
                            <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>AirSense AI</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">Instrument-grade air quality forecasting for 50+ Indian cities, built on daily-refreshed AI models.</p>
                    </div>
                    <div>
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>Dashboard</li><li>Reports</li><li>Alerts</li><li>API Access</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>hello@airsense.ai</li><li>+91 98xxx xxxxx</li><li>Greater Noida, IN</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Follow</h4>
                        <div className="flex gap-3 text-slate-400">
                            <a href="#" aria-label="GitHub" className="hover:text-white"><SiGithub size={17} color="currentColor" /></a>
                            <a href="#" aria-label="X (Twitter)" className="hover:text-white"><SiX size={17} color="currentColor" /></a>
                            <a href="#" aria-label="LinkedIn" className="hover:text-white"><SiLinkedin size={17} color="currentColor" /></a>
                            <a href="#" aria-label="Instagram" className="hover:text-white"><SiInstagram size={17} color="currentColor" /></a>
                        </div>
                    </div>
                </div>
                <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>© 2026 AirSense AI. All rights reserved.</span>
                    <div className="flex gap-4"><span>Privacy Policy</span><span>Terms of Service</span></div>
                </div>
            </div>
        </footer>
    );
}