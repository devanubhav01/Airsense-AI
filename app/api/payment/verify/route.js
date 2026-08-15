import crypto from "crypto";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Report from "@/models/Report";
import City from "@/models/City";
import { generateReportPdfBuffer } from "@/lib/reportPdf";
import { sendReportEmail } from "@/lib/sendReportEmail";

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ success: false, error: "Missing payment fields" }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            await Report.findOneAndUpdate({ orderId: razorpay_order_id }, { $set: { status: "Failed" } });
            return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
        }

        const report = await Report.findOne({ orderId: razorpay_order_id });
        if (!report) {
            return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
        }

        // --- STEP 7: PDF generation + email ---
        try {
            const cityData = await City.findOne({ name: report.city });
            if (!cityData) throw new Error(`No cached data for ${report.city}`);

            const pdfBuffer = await generateReportPdfBuffer({ city: report.city, cityData });

            await sendReportEmail({
                to: report.deliveryEmail,
                city: report.city,
                aqi: cityData.aqi,
                pdfBuffer,
            });

            report.status = "Delivered";
            await report.save();
        } catch (pdfErr) {
            console.error("PDF/email generation failed:", pdfErr);
            report.status = "Failed";
            await report.save();
        }

        return NextResponse.json({ success: true, data: report });
    } catch (err) {
        console.error("POST /api/payment/verify error:", err);
        return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
    }
}