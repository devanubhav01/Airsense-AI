import mongoose from "mongoose";

const OtpVerificationSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, index: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

// Expired OTP docs ko MongoDB khud hi auto-delete kar dega
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OtpVerification ||
    mongoose.model("OtpVerification", OtpVerificationSchema);