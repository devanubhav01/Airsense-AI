"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LogOut, Loader2 } from "lucide-react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Field, { inputCls } from "@/components/Field";
import { useAuth } from "@/components/AuthContext";
import { STATE_CITY_MAP, REPORTS_HISTORY } from "@/lib/data";

export default function AccountPage() {
    const router = useRouter();
    const { user, signOut } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState("");
    const [state, setState] = useState("Delhi");
    const [profileCity, setProfileCity] = useState("New Delhi");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!user?.email) return;

        setEmail(user.email);
        setName(user.name || "");
        setAge(user.age ? String(user.age) : "");
        setState(user.state || "Delhi");
        setProfileCity(user.city || "New Delhi");

        fetch(`/api/user?email=${encodeURIComponent(user.email)}`)
            .then((res) => res.json())
            .then((json) => {
                if (json.success && json.data) {
                    setName(json.data.name || user.name || "");
                    setAge(json.data.age ? String(json.data.age) : "");
                    setState(json.data.state || "Delhi");
                    setProfileCity(json.data.city || "New Delhi");
                }
            })
            .catch((err) => {
                console.error("Failed to load profile:", err);
            })
            .finally(() => setLoading(false));
    }, [user]);

    async function saveProfile() {
        if (!email) return;

        setSaving(true);
        setMessage("");

        try {
            const res = await fetch("/api/user", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    name,
                    age: age ? Number(age) : undefined,
                    state,
                    city: profileCity,
                }),
            });

            const json = await res.json();

            if (!json.success) {
                throw new Error(
                    json.error || "Failed to save profile"
                );
            }

            setMessage("Profile saved successfully.");
        } catch (err) {
            setMessage(
                err.message || "Failed to save profile."
            );
        } finally {
            setSaving(false);
        }
    }

    async function logout() {
        await signOut({
            callbackUrl: "/",
        });
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
                <div className="flex items-center gap-2 text-slate-500">
                    <Loader2
                        size={18}
                        className="animate-spin"
                    />
                    Loading your profile...
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl bg-slate-50 px-5 py-10 lg:px-8">

            <h1
                className="text-2xl font-semibold text-slate-900"
                style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                }}
            >
                My Account
            </h1>

            <Card className="mt-6">

                <h3 className="mb-4 text-[15px] font-semibold text-slate-900">
                    Profile details
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">

                    {/* Name */}
                    <Field label="Full name">
                        <input
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            className={inputCls}
                        />
                    </Field>

                    {/* Email */}
                    <Field label="Email">
                        <input
                            value={email}
                            readOnly
                            className={`${inputCls} cursor-not-allowed bg-slate-50 opacity-70`}
                        />
                    </Field>

                    {/* Age */}
                    <Field label="Age">
                        <input
                            value={age}
                            onChange={(e) =>
                                setAge(e.target.value)
                            }
                            type="number"
                            min="1"
                            className={inputCls}
                        />
                    </Field>

                    {/* State */}
                    <Field label="State">
                        <select
                            value={state}
                            onChange={(e) => {
                                const nextState =
                                    e.target.value;

                                setState(nextState);

                                setProfileCity(
                                    STATE_CITY_MAP[
                                        nextState
                                    ]?.[0] || ""
                                );
                            }}
                            className={inputCls}
                        >
                            {Object.keys(
                                STATE_CITY_MAP
                            ).map((s) => (
                                <option
                                    key={s}
                                    value={s}
                                >
                                    {s}
                                </option>
                            ))}
                        </select>
                    </Field>

                    {/* City */}
                    <Field label="City">
                        <select
                            value={profileCity}
                            onChange={(e) =>
                                setProfileCity(
                                    e.target.value
                                )
                            }
                            className={inputCls}
                        >
                            {(
                                STATE_CITY_MAP[state] ||
                                []
                            ).map((c) => (
                                <option
                                    key={c}
                                    value={c}
                                >
                                    {c}
                                </option>
                            ))}
                        </select>
                    </Field>

                </div>

                <Button
                    variant="primary"
                    className="mt-5"
                    onClick={saveProfile}
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "Save Changes"}
                </Button>

                {message && (
                    <p className="mt-3 text-xs text-slate-500">
                        {message}
                    </p>
                )}

            </Card>

            <h2 className="mt-9 text-sm font-semibold uppercase tracking-wide text-slate-500">
                My Reports
            </h2>

            <Card className="mt-4 overflow-hidden !p-0">

                <table className="w-full text-sm">

                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

                            <th className="px-5 py-3 font-medium">
                                Date
                            </th>

                            <th className="px-5 py-3 font-medium">
                                Report Type
                            </th>

                            <th className="px-5 py-3 font-medium">
                                Status
                            </th>

                        </tr>
                    </thead>

                    <tbody>

                        {REPORTS_HISTORY.map(
                            (r, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-slate-100 last:border-0"
                                >

                                    <td className="px-5 py-3 text-slate-500">
                                        {r.date}
                                    </td>

                                    <td className="px-5 py-3 text-slate-800">
                                        {r.type}
                                    </td>

                                    <td className="px-5 py-3">

                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600">

                                            <CheckCircle2
                                                size={11}
                                            />

                                            {r.status}

                                        </span>

                                    </td>

                                </tr>
                            )
                        )}

                    </tbody>

                </table>

            </Card>

            <Button
                variant="danger"
                className="mt-8"
                onClick={logout}
            >
                <LogOut size={14} />
                Logout
            </Button>

        </div>
    );
}
