import mongoose, { Schema, models, model } from "mongoose";

const AlertSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: ["daily", "severe", "weekly"], required: true },
        enabled: { type: Boolean, default: true },
        lastTriggeredAt: { type: Date },
        message: { type: String },
    },
    { timestamps: true }
);

export default models.Alert || model("Alert", AlertSchema);