import { NextResponse } from "next/server";
import { Resend } from "resend";
import dbConnect from "@/lib/mongodb";
import OtpVerification from "@/models/OtpVerification";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minute validity

        await dbConnect();
        await OtpVerification.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        await resend.emails.send({
            from: "AirSense AI <onboarding@resend.dev>", // apna domain verify karke isko badal dena
            to: email,
            subject: "Your AirSense AI verification code",
            html: `<p>Your OTP code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("send-otp failed:", err);
        return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
    }
}