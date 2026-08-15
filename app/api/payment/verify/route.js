import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Report from "@/lib/models/Report";

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ success: false, error: "Missing payment fields" }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const isValid = expectedSignature === razorpay_signature;

        if (!isValid) {
            await Report.findOneAndUpdate({ orderId: razorpay_order_id }, { $set: { status: "Failed" } });
            return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
        }

        // --- STEP 7 HOOK: trigger PDF generation + email delivery here ---
        const report = await Report.findOneAndUpdate(
            { orderId: razorpay_order_id },
            { $set: { status: "Delivered" } },
            { new: true }
        );

        return NextResponse.json({ success: true, data: report });
    } catch (err) {
        console.error("POST /api/payment/verify error:", err);
        return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
    }
}