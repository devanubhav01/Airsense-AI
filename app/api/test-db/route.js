import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await dbConnect();
        return NextResponse.json({ status: "connected" });
    } catch (err) {
        return NextResponse.json({ status: "error", error: String(err) }, { status: 500 });
    }
}