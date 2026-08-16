import mongoose, { Schema, models, model } from "mongoose";

const CitySchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        aqi: { type: Number, required: true },
        pollutants: {
            pm25: Number,
            pm10: Number,
            no2: Number,
            so2: Number,
            co: Number,
            o3: Number,
        },
        forecast7Day: [{ day: String, aqi: Number }],
        lastFetchedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default models.City || model("City", CitySchema);