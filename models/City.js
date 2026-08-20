import mongoose, { Schema, models, model } from "mongoose";

const StationSchema = new Schema(
  {
    uid: Schema.Types.Mixed,
    lat: Number,
    lon: Number,
    aqi: Number,
    station: String,
  },
  { _id: false }
);

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
    forecast7Day: [{ day: String, date: String, aqi: Number, min: Number, max: Number, baselineAQI: Number, weatherAdjustment: Number, confidence: Number }],
    weather: {
      current: {
        temperature: Number,
        humidity: Number,
        windSpeed: Number,
        pressure: Number,
        cloudCover: Number,
      },
      daily: {
        dates: [String],
        temperatureMax: [Number],
        temperatureMin: [Number],
        humidity: [Number],
        windSpeed: [Number],
        precipitation: [Number],
      },
      source: String,
    },
    stations: { type: [StationSchema], default: [] },
    satelliteImageUrl: String,
    satelliteDate: String,
    forecastSource: String,
    dataStatus: {
      aqi: {
        status: { type: String, enum: ["ok", "stale", "unavailable"] },
        source: String,
        fetchedAt: Date,
        error: String,
      },
      weather: {
        status: { type: String, enum: ["ok", "stale", "unavailable"] },
        source: String,
        fetchedAt: Date,
        error: String,
      },
      stations: {
        status: { type: String, enum: ["ok", "stale", "unavailable"] },
        source: String,
        fetchedAt: Date,
        error: String,
        count: Number,
      },
      satellite: {
        status: { type: String, enum: ["ok", "stale", "unavailable"] },
        source: String,
        fetchedAt: Date,
        error: String,
        date: String,
      },
    },
    stationName: String,
    lastFetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.City || model("City", CitySchema);
