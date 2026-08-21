/*
 * AirSense Hybrid Forecast Engine
 *
 * This is intentionally transparent: it fuses the live station AQI,
 * WAQI's daily PM2.5 forecast and meteorological features from Open-Meteo.
 * It is not presented as a secretly trained model.
 */

function clamp(value, min = 0, max = 500) {
  return Math.max(min, Math.min(max, value));
}

function weatherAdjustment({ humidity, windSpeed, precipitation, temperature }) {
  let adjustment = 0;

  // Stagnant, humid air generally increases near-surface pollution persistence.
  if (Number.isFinite(humidity)) adjustment += (humidity - 55) * 0.18;
  if (Number.isFinite(windSpeed)) adjustment += (10 - windSpeed) * 1.15;
  if (Number.isFinite(precipitation)) adjustment -= Math.min(precipitation * 2.2, 18);

  // Mildly penalise very hot/cold extremes without letting temperature dominate AQI.
  if (Number.isFinite(temperature)) {
    const heatStress = Math.max(0, Math.abs(temperature - 27) - 8);
    adjustment += heatStress * 0.35;
  }

  return adjustment;
}

export function buildHybridForecast({ currentAQI, waqiForecast = [], weather }) {
  const dates = weather?.daily?.dates || [];
  const result = [];

  for (let i = 0; i < 7; i += 1) {
    const base = Number(waqiForecast[i]?.aqi);
    const fallbackBase = Number(currentAQI);
    const stationBaseline = Number.isFinite(base) ? base : fallbackBase;

    const humidity = Number(weather?.daily?.humidity?.[i]);
    const windSpeed = Number(weather?.daily?.windSpeed?.[i]);
    const precipitation = Number(weather?.daily?.precipitation?.[i]);
    const temperature = Number(weather?.daily?.temperatureMax?.[i]);

    const adjustment = weatherAdjustment({
      humidity,
      windSpeed,
      precipitation,
      temperature,
    });

    // 72% station/WAQI signal + 28% weather-conditioned signal.
    const modelValue = clamp(
      Math.round(stationBaseline * 0.72 + (stationBaseline + adjustment) * 0.28)
    );

    const date = dates[i] || null;
    result.push({
      day: date
        ? new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" })
        : `D${i + 1}`,
      date,
      aqi: modelValue,
      baselineAQI: Math.round(stationBaseline),
      weatherAdjustment: Math.round(adjustment * 10) / 10,
      confidence: Math.max(62, Math.min(94, 91 - Math.abs(adjustment) * 0.6)),
    });
  }

  return result;
}
