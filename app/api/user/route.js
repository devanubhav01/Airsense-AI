import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET(request) {
    try {
        await connectDB();
        const email = request.nextUrl.searchParams.get("email");
        if (!email) {
            return NextResponse.json({ success: false, error: "email is required" }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user });
    } catch (err) {
        console.error("GET /api/user error:", err);
        return NextResponse.json({ success: false, error: "Failed to fetch user" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { email, name, age, state, city } = body;

        if (!email) {
            return NextResponse.json({ success: false, error: "email is required" }, { status: 400 });
        }

        const user = await User.findOneAndUpdate(
            { email },
            { $set: { name, age, state, city } },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, data: user });
    } catch (err) {
        console.error("PUT /api/user error:", err);
        return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
    }
}