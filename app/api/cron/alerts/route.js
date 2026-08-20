import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Alert from "@/models/Alert";
import { fetchLiveAQI } from "@/lib/waqi";
import { fetchWeather } from "@/lib/weather";
import { buildHybridForecast } from "@/lib/forecast";
import { sendAlertEmail } from "@/lib/sendAlertEmail";

function authorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}` || request.nextUrl.searchParams.get("secret") === secret;
}

function sameDay(a, b = new Date()) {
  if (!a) return false;
  const x = new Date(a);
  return x.toDateString() === new Date(b).toDateString();
}

export async function GET(request) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const users = await User.find({
      email: { $exists: true, $ne: null },
      city: { $exists: true, $ne: null },
    }).lean();

    const results = [];

    for (const user of users) {
      const city = user.city;
      const preferencesDoc = await Alert.findOne({ userId: user._id });
      const preferences = preferencesDoc?.preferences || { daily: true, severe: true, weekly: false };

      let live;
      try {
        live = await fetchLiveAQI(city);
      } catch (error) {
        results.push({ email: user.email, city, status: "skipped", reason: error.message });
        continue;
      }

      const actions = [];
      const now = new Date();

      if (preferences.severe && live.aqi >= 200) {
        const recentlySame = preferencesDoc?.lastSevereAqi === live.aqi &&
          preferencesDoc?.lastTriggeredAt &&
          Date.now() - new Date(preferencesDoc.lastTriggeredAt).getTime() < 6 * 60 * 60 * 1000;

        if (!recentlySame) {
          const message = `AQI has reached ${live.aqi}. Avoid prolonged outdoor activity and use a well-fitted mask if you must go outside.`;
          try {
            await sendAlertEmail({ to: user.email, city, aqi: live.aqi, type: "severe", message });
            actions.push("severe-email");
            await Alert.findOneAndUpdate(
              { userId: user._id },
              {
                $set: { lastSevereAqi: live.aqi, lastTriggeredAt: now },
                $push: { history: { $each: [{ type: "severe", city, aqi: live.aqi, message }], $slice: -30 } },
              },
              { upsert: true, setDefaultsOnInsert: true }
            );
          } catch (emailError) {
            actions.push(`severe-email-failed:${emailError.message}`);
          }
        }
      }

      if (preferences.daily && !sameDay(preferencesDoc?.lastDailyAt)) {
        const message = `Today's AQI is ${live.aqi}. AirSense recommends checking the forecast before planning outdoor activity.`;
        try {
          await sendAlertEmail({ to: user.email, city, aqi: live.aqi, type: "daily", message });
          actions.push("daily-email");
          await Alert.findOneAndUpdate(
            { userId: user._id },
            {
              $set: { lastDailyAt: now },
              $push: { history: { $each: [{ type: "daily", city, aqi: live.aqi, message }], $slice: -30 } },
            },
            { upsert: true, setDefaultsOnInsert: true }
          );
        } catch (emailError) {
          actions.push(`daily-email-failed:${emailError.message}`);
        }
      }

      if (preferences.weekly && now.getDay() === 0 && !sameDay(preferencesDoc?.lastWeeklyAt)) {
        const weather = await fetchWeather(city).catch(() => null);
        const forecast = buildHybridForecast({ currentAQI: live.aqi, waqiForecast: live.forecast, weather });
        const avg = Math.round(forecast.reduce((sum, item) => sum + item.aqi, 0) / Math.max(forecast.length, 1));
        const message = `Your upcoming 7-day average forecast is ${avg}. Review the daily trend in your AirSense dashboard.`;
        try {
          await sendAlertEmail({ to: user.email, city, aqi: avg, type: "weekly", message });
          actions.push("weekly-email");
          await Alert.findOneAndUpdate(
            { userId: user._id },
            {
              $set: { lastWeeklyAt: now },
              $push: { history: { $each: [{ type: "weekly", city, aqi: avg, message }], $slice: -30 } },
            },
            { upsert: true, setDefaultsOnInsert: true }
          );
        } catch (emailError) {
          actions.push(`weekly-email-failed:${emailError.message}`);
        }
      }

      results.push({ email: user.email, city, aqi: live.aqi, actions });
    }

    return NextResponse.json({ success: true, processed: users.length, results });
  } catch (err) {
    console.error("GET /api/cron/alerts error:", err);
    return NextResponse.json({ success: false, error: "Alert job failed" }, { status: 500 });
  }
}
