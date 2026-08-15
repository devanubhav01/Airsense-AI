import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { razorpay } from "@/lib/razorpay";
import Report from "@/models/Report";

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { userId, city, deliveryEmail, amount = 49 } = body;

        if (!userId || !city || !deliveryEmail) {
            return NextResponse.json({ success: false, error: "userId, city and deliveryEmail are required" }, { status: 400 });
        }

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        const report = await Report.create({
            userId,
            city,
            deliveryEmail,
            amount,
            status: "Pending",
            orderId: order.id,
        });

        return NextResponse.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                reportId: report._id,
            },
        });
    } catch (err) {
        console.error("POST /api/payment/create-order error:", err);
        return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
    }
}