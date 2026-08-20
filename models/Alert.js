import mongoose, { Schema, models, model } from "mongoose";

const HistorySchema = new Schema(
  {
    type: { type: String, enum: ["daily", "severe", "weekly"] },
    city: String,
    aqi: Number,
    message: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AlertSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    preferences: {
      daily: { type: Boolean, default: true },
      severe: { type: Boolean, default: true },
      weekly: { type: Boolean, default: false },
    },
    lastSevereAqi: Number,
    lastDailyAt: Date,
    lastWeeklyAt: Date,
    history: { type: [HistorySchema], default: [] },

    // Legacy fields kept optional so existing documents do not break.
    type: { type: String, enum: ["daily", "severe", "weekly"] },
    enabled: Boolean,
    lastTriggeredAt: Date,
    message: String,
  },
  { timestamps: true }
);

export default models.Alert || model("Alert", AlertSchema);
