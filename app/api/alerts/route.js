import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Alert from "@/models/Alert";

export async function GET(request) {
  try {
    await dbConnect();
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });

    let alert = await Alert.findOne({ userId });
    if (!alert) alert = await Alert.create({ userId });

    return NextResponse.json({
      success: true,
      data: {
        preferences: {
          daily: alert.preferences?.daily ?? true,
          severe: alert.preferences?.severe ?? true,
          weekly: alert.preferences?.weekly ?? false,
        },
        history: alert.history || [],
      },
    });
  } catch (err) {
    console.error("GET /api/alerts error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const { userId, preferences } = await request.json();
    if (!userId || !preferences) {
      return NextResponse.json({ success: false, error: "userId and preferences are required" }, { status: 400 });
    }

    const safePreferences = {
      daily: Boolean(preferences.daily),
      severe: Boolean(preferences.severe),
      weekly: Boolean(preferences.weekly),
    };

    const alert = await Alert.findOneAndUpdate(
      { userId },
      { $set: { preferences: safePreferences } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, data: { preferences: alert.preferences } });
  } catch (err) {
    console.error("PUT /api/alerts error:", err);
    return NextResponse.json({ success: false, error: "Failed to update alerts" }, { status: 500 });
  }
}
