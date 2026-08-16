import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, default: "7-Day Forecast Report" },
        city: { type: String, required: true },
        status: { type: String, enum: ["Pending", "Delivered", "Failed"], default: "Pending" },
        orderId: { type: String },
        amount: { type: Number, default: 49 },
        deliveryEmail: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);