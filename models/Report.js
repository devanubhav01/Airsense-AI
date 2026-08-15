import mongoose, { Schema, models, model } from "mongoose";

const ReportSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, required: true },
        status: { type: String, enum: ["Pending", "Delivered", "Failed"], default: "Pending" },
        date: { type: Date, default: Date.now },
        city: { type: String },
        fileUrl: { type: String },
    },
    { timestamps: true }
);

export default models.Report || model("Report", ReportSchema);