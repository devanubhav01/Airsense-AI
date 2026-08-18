"use client";

import {
    useState,
    Suspense
} from "react";

import {
    useRouter,
    useSearchParams
} from "next/navigation";

import {
    useSession
} from "next-auth/react";

import Script from "next/script";

import {
    FileText,
    CheckCircle2,
    ShieldCheck,
    CreditCard,
    Smartphone,
    Building2,
    Loader2
} from "lucide-react";

import Card from "@/components/Card";
import Button from "@/components/Button";
import Field, {
    inputCls
} from "@/components/Field";

function ReportPageContent() {

    const router = useRouter();

    const {
        data: session
    } = useSession();

    const searchParams =
        useSearchParams();

    const city =
        searchParams.get("city") ||
        "Delhi";

    const [step, setStep] =
        useState(1);

    const [payEmail, setPayEmail] =
        useState(
            session?.user?.email || ""
        );

    const [method, setMethod] =
        useState("upi");

    const [paying, setPaying] =
        useState(false);

    const [error, setError] =
        useState("");

    const [orderId, setOrderId] =
        useState("");

    const included = [
        "7-day AQI forecast",
        "Full pollutant analysis",
        "Personalised health recommendations",
        "30-day historical trends",
    ];

    async function startPayment() {

        setError("");

        if (!session?.user?.id) {

            setError(
                "Please log in again before purchasing a report."
            );

            return;
        }

        setPaying(true);

        try {

            /*
             * The backend ignores any client-supplied
             * amount and always creates a ₹1 test order.
             */

            const orderRes =
                await fetch(
                    "/api/payment/create-order",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            userId:
                                session.user.id,

                            city,

                            deliveryEmail:
                                payEmail,

                            amount: 1,
                        }),
                    }
                );

            const orderJson =
                await orderRes.json();

            if (!orderJson.success) {

                throw new Error(
                    orderJson.error ||
                    "Could not create order"
                );
            }

            const {
                orderId: rzpOrderId,
                amount,
                currency
            } = orderJson.data;

            const options = {

                key:
                    process.env
                        .NEXT_PUBLIC_RAZORPAY_KEY_ID,

                amount,

                currency,

                name:
                    "AirSense AI",

                description:
                    `${city} — 7-Day Forecast Report`,

                order_id:
                    rzpOrderId,

                prefill: {
                    email: payEmail,
                },

                theme: {
                    color:
                        "#4F46E5",
                },

                method: {
                    upi:
                        method === "upi",

                    card:
                        method === "card",

                    netbanking:
                        method === "netbanking",
                },

                handler:
                    async function (
                        response
                    ) {

                        try {

                            const verifyRes =
                                await fetch(
                                    "/api/payment/verify",
                                    {
                                        method:
                                            "POST",

                                        headers: {
                                            "Content-Type":
                                                "application/json",
                                        },

                                        body:
                                            JSON.stringify(
                                                {
                                                    razorpay_order_id:
                                                        response.razorpay_order_id,

                                                    razorpay_payment_id:
                                                        response.razorpay_payment_id,

                                                    razorpay_signature:
                                                        response.razorpay_signature,
                                                }
                                            ),
                                    }
                                );

                            const verifyJson =
                                await verifyRes.json();

                            if (
                                !verifyJson.success
                            ) {

                                throw new Error(
                                    verifyJson.error ||
                                    "Verification failed"
                                );
                            }

                            setOrderId(
                                response.razorpay_payment_id
                            );

                            setStep(4);

                        } catch (err) {

                            setError(
                                err.message
                            );

                        } finally {

                            setPaying(false);
                        }
                    },

                modal: {

                    ondismiss:
                        function () {
                            setPaying(false);
                        },

                },
            };

            const rzp =
                new window.Razorpay(
                    options
                );

            rzp.on(
                "payment.failed",
                function () {

                    setError(
                        "Payment failed. Please try again."
                    );

                    setPaying(false);
                }
            );

            rzp.open();

        } catch (err) {

            setError(
                err.message
            );

            setPaying(false);
        }
    }

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
            />

            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-5 py-16">

                <Card className="w-full max-w-md">

                    {/* Steps */}

                    {step < 4 && (

                        <div className="mb-6 flex items-center gap-2">

                            {[1, 2, 3].map(
                                (s) => (

                                    <div
                                        key={s}
                                        className="flex flex-1 items-center gap-2"
                                    >

                                        <div
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                                                step >= s
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-slate-100 text-slate-400"
                                            }`}
                                        >
                                            {s}
                                        </div>

                                        {s < 3 && (
                                            <div className="h-px flex-1 bg-slate-200" />
                                        )}

                                    </div>

                                )
                            )}

                        </div>
                    )}

                    {/* STEP 1 */}

                    {step === 1 && (

                        <>

                            <div className="mb-5 flex items-center gap-3">

                                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                    <FileText size={20} />
                                </span>

                                <div>

                                    <h2
                                        className="text-lg font-semibold text-slate-900"
                                        style={{
                                            fontFamily:
                                                "'Space Grotesk', sans-serif"
                                        }}
                                    >
                                        Detailed AQI Report
                                    </h2>

                                    <p className="text-xs text-slate-500">
                                        {city}
                                    </p>

                                </div>

                            </div>

                            <div className="space-y-2">

                                {included.map(
                                    (item) => (

                                        <div
                                            key={item}
                                            className="flex items-center gap-2 text-sm text-slate-600"
                                        >

                                            <CheckCircle2
                                                size={15}
                                                className="text-emerald-500"
                                            />

                                            {item}

                                        </div>

                                    )
                                )}

                            </div>

                            <div className="mt-6 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">

                                <span className="text-sm text-slate-500">
                                    Report price
                                </span>

                                <span
                                    className="text-xl font-semibold text-slate-900"
                                    style={{
                                        fontFamily:
                                            "'JetBrains Mono', monospace"
                                    }}
                                >
                                    ₹1
                                </span>

                            </div>

                            <Button
                                variant="primary"
                                className="mt-5 w-full"
                                onClick={() =>
                                    setStep(2)
                                }
                            >
                                Continue
                            </Button>

                        </>
                    )}

                    {/* STEP 2 */}

                    {step === 2 && (

                        <>

                            <h2
                                className="text-lg font-semibold text-slate-900"
                                style={{
                                    fontFamily:
                                        "'Space Grotesk', sans-serif"
                                }}
                            >
                                Delivery details
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Your report will be sent to this email.
                            </p>

                            <Field
                                label="Email"
                                className="mt-5"
                            >
                                <input
                                    type="email"
                                    value={payEmail}
                                    onChange={(e) =>
                                        setPayEmail(
                                            e.target.value
                                        )
                                    }
                                    className={inputCls}
                                    placeholder="you@example.com"
                                />
                            </Field>

                            <div className="mt-5 flex gap-2">

                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() =>
                                        setStep(1)
                                    }
                                >
                                    Back
                                </Button>

                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={() =>
                                        setStep(3)
                                    }
                                    disabled={
                                        !payEmail
                                    }
                                >
                                    Continue
                                </Button>

                            </div>

                        </>
                    )}

                    {/* STEP 3 */}

                    {step === 3 && (

                        <>

                            <h2
                                className="text-lg font-semibold text-slate-900"
                                style={{
                                    fontFamily:
                                        "'Space Grotesk', sans-serif"
                                }}
                            >
                                Payment
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Select your preferred payment method.
                            </p>

                            <div className="mt-5 grid grid-cols-3 gap-2">

                                {[
                                    {
                                        id: "upi",
                                        l: "UPI",
                                        icon: Smartphone
                                    },
                                    {
                                        id: "card",
                                        l: "Card",
                                        icon: CreditCard
                                    },
                                    {
                                        id: "netbanking",
                                        l: "Net Banking",
                                        icon: Building2
                                    }
                                ].map(
                                    (m) => (

                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() =>
                                                setMethod(
                                                    m.id
                                                )
                                            }
                                            className={`flex flex-col items-center gap-2 rounded-lg border px-3 py-3 text-xs ${
                                                method ===
                                                m.id
                                                    ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                                                    : "border-slate-200 text-slate-500"
                                            }`}
                                        >

                                            <m.icon
                                                size={16}
                                            />

                                            {m.l}

                                        </button>

                                    )
                                )}

                            </div>

                            {error && (
                                <p className="mt-3 text-xs text-red-500">
                                    {error}
                                </p>
                            )}

                            <Button
                                variant="primary"
                                className="mt-5 w-full"
                                onClick={
                                    startPayment
                                }
                                disabled={paying}
                            >

                                {paying ? (

                                    <>
                                        <Loader2
                                            size={15}
                                            className="animate-spin"
                                        />

                                        Processing

                                    </>

                                ) : (

                                    <>
                                        Pay ₹1 & Get Report
                                    </>

                                )}

                            </Button>

                            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">

                                <ShieldCheck
                                    size={12}
                                />

                                Secure Payment

                            </p>

                            <p className="mt-2 text-center text-[10px] leading-relaxed text-slate-400">

                                Disclaimer: This payment is in test mode. You will not be charged real money , 
                                UPI currently doesn’t work in Test Mode. Please select any other payment option (Net Banking, Wallet, etc.)
                                and choose any bank. The payment will be successful in Test Mode, and the report will be sent to your registered email.

                            </p>

                        </>
                    )}

                    {/* STEP 4 */}

                    {step === 4 && (

                        <div className="text-center">

                            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">

                                <CheckCircle2
                                    size={30}
                                />

                            </span>

                            <h2
                                className="text-lg font-semibold text-slate-900"
                                style={{
                                    fontFamily:
                                        "'Space Grotesk', sans-serif"
                                }}
                            >
                                Payment successful!
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">

                                Report sent to{" "}
                                {payEmail}

                            </p>

                            <div
                                className="mx-auto mt-4 w-fit rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500"
                                style={{
                                    fontFamily:
                                        "'JetBrains Mono', monospace"
                                }}
                            >
                                Payment ID:{" "}
                                {orderId}
                            </div>

                            <Button
                                variant="primary"
                                className="mt-6 w-full"
                                onClick={() =>
                                    router.push(
                                        "/dashboard"
                                    )
                                }
                            >
                                Back to Dashboard
                            </Button>

                        </div>
                    )}

                </Card>

            </div>
        </>
    );
}

export default function ReportPage() {

    return (

        <Suspense
            fallback={
                <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">

                    <Loader2
                        size={24}
                        className="animate-spin text-indigo-600"
                    />

                </div>
            }
        >

            <ReportPageContent />

        </Suspense>
    );
}
