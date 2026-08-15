import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Report from "@/lib/models/Report";

export async function GET(request) {
    try {
        await connectDB();
        const userId = request.nextUrl.searchParams.get("userId");
        if (!userId) {
            return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
        }

        const reports = await Report.find({ userId }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: reports });
    } catch (err) {
        console.error("GET /api/reports error:", err);
        return NextResponse.json({ success: false, error: "Failed to fetch reports" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { userId, city, deliveryEmail, amount } = body;

        if (!userId || !city || !deliveryEmail) {
            return NextResponse.json({ success: false, error: "userId, city and deliveryEmail are required" }, { status: 400 });
        }

        const report = await Report.create({
            userId,
            city,
            deliveryEmail,
            amount: amount ?? 49,
            status: "Pending",
        });

        return NextResponse.json({ success: true, data: report }, { status: 201 });
    } catch (err) {
        console.error("POST /api/reports error:", err);
        return NextResponse.json({ success: false, error: "Failed to create report" }, { status: 500 });
    }
}