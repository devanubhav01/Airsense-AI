import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Alert from "@/models/Alert";

export async function GET(request) {
    try {
        await connectDB();
        const userId = request.nextUrl.searchParams.get("userId");
        if (!userId) {
            return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
        }

        let alert = await Alert.findOne({ userId });
        if (!alert) {
            alert = await Alert.create({ userId });
        }

        return NextResponse.json({ success: true, data: alert });
    } catch (err) {
        console.error("GET /api/alerts error:", err);
        return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { userId, preferences } = body;

        if (!userId || !preferences) {
            return NextResponse.json({ success: false, error: "userId and preferences are required" }, { status: 400 });
        }

        const alert = await Alert.findOneAndUpdate(
            { userId },
            { $set: { preferences } },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, data: alert });
    } catch (err) {
        console.error("PUT /api/alerts error:", err);
        return NextResponse.json({ success: false, error: "Failed to update alerts" }, { status: 500 });
    }
}