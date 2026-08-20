"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, Bell, ChevronDown, Menu, X, User, FileText, LogOut } from "lucide-react";
import Button from "./Button";
import { useAuth } from "./AuthContext";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { loggedIn, user, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);

    const navItems = [
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Reports", href: "/report" },
        { label: "Alerts", href: "/alerts" },
        { label: "Gov Analytics", href: "/admin" },
    ];

    function go(href) {
        const protectedRoutes = ["/dashboard", "/report", "/alerts", "/account"];
        if (protectedRoutes.includes(href) && !loggedIn) {
            router.push("/login");
        } else {
            router.push(href);
        }
        setMobileOpen(false);
    }

    function handleLogout() {
        signOut({ callbackUrl: "/" });
        setAvatarOpen(false);
    }

    const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "U";

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
                <button onClick={() => go("/")} className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Leaf size={18} />
                    </span>
                    <span className="text-[15px] font-semibold tracking-tight text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        AirSense <span className="text-indigo-600">AI</span>
                    </span>
                </button>

                <nav className="hidden items-center gap-8 md:flex">
                    {navItems.map((item, i) => (
                        <button key={i} onClick={() => go(item.href)} className={`text-sm font-medium transition-colors ${pathname === item.href ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    {!loggedIn ? (
                        <>
                            <button onClick={() => router.push("/login")} className="text-sm font-medium text-slate-600 hover:text-slate-900">Login</button>
                            <Button variant="primary" className="px-4 py-2" onClick={() => router.push("/login")}>Sign Up</Button>
                        </>
                    ) : (
                        <>
                            <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                                <Bell size={18} />
                                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                            </button>
                            <div className="relative">
                                <button onClick={() => setAvatarOpen((v) => !v)} className="flex items-center gap-1.5 rounded-full border border-slate-300 py-1 pl-1 pr-2.5 hover:border-slate-400">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">{initials}</span>
                                    <ChevronDown size={14} className="text-slate-500" />
                                </button>
                                {avatarOpen && (
                                    <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                        <Link href="/account" onClick={() => setAvatarOpen(false)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">
                                            <User size={14} /> My Account
                                        </Link>
                                        <Link href="/account" onClick={() => setAvatarOpen(false)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">
                                            <FileText size={14} /> My Reports
                                        </Link>
                                        <button onClick={handleLogout} className="flex w-full items-center gap-2 border-t border-slate-200 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-slate-50">
                                            <LogOut size={14} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <button className="md:hidden text-slate-700" onClick={() => setMobileOpen((v) => !v)}>
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {mobileOpen && (
                <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
                    <div className="flex flex-col gap-1">
                        {navItems.map((item, i) => (
                            <button key={i} onClick={() => go(item.href)} className="rounded-lg px-2 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                                {item.label}
                            </button>
                        ))}
                        <div className="mt-2 flex gap-2 border-t border-slate-200 pt-3">
                            {!loggedIn ? (
                                <>
                                    <Button variant="ghost" className="flex-1" onClick={() => go("/login")}>Login</Button>
                                    <Button variant="primary" className="flex-1" onClick={() => go("/login")}>Sign Up</Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" className="flex-1" onClick={() => go("/account")}>Account</Button>
                                    <Button variant="danger" className="flex-1" onClick={handleLogout}>Logout</Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
