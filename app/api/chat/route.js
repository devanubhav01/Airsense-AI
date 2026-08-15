import { NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";
const SYSTEM_PROMPT = `You are AirBot, the AI assistant for AirSense AI, an Indian air quality prediction platform. You are helpful, friendly, and knowledgeable across all topics — not just air quality.

Guidelines:
- Answer any question the user asks, on any topic, clearly and helpfully.
- If the topic relates to air pollution, AQI levels, or health precautions, tailor advice to AQI level (Good 0-50, Moderate 51-100, Poor 101-200, Severe 201-300, Hazardous 301-500) and give practical guidance: safety of going outside, mask usage (N95/N99), air purifiers, exercise precautions, and advice for sensitive groups (children, elderly, asthma/respiratory patients, pregnant women).
- Keep answers concise and in plain, friendly language. Use Hindi-English (Hinglish) mix if the user writes in Hinglish, otherwise match their language.
- You are not a doctor. For serious symptoms (breathing difficulty, chest pain), always advise seeing a doctor immediately.
- Do not make up specific AQI numbers for a city unless the user has told you the number or you were given it as context — for those questions, be upfront that you don't have live data access.`;


// Models tried in order — falls back if one is overloaded/unavailable
const MODEL_CANDIDATES = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

async function generateWithFallback(params, retriesPerModel = 1) {
    let lastErr;

    for (const model of MODEL_CANDIDATES) {
        for (let attempt = 0; attempt <= retriesPerModel; attempt++) {
            try {
                return await genAI.models.generateContent({ ...params, model });
            } catch (err) {
                lastErr = err;
                const status = err?.status ?? err?.error?.code;
                const isOverloaded = status === 503;
                const isNotFound = status === 404;

                if (isNotFound) {
                    // this model isn't available at all — no point retrying it, move to next model
                    break;
                }
                if (isOverloaded && attempt < retriesPerModel) {
                    await new Promise((r) => setTimeout(r, 1000 * (attempt + 1))); // 1s backoff
                    continue;
                }
                // any other error (or overloaded with no retries left) -> try next model
                break;
            }
        }
    }

    throw lastErr;
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { messages, cityContext } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ success: false, error: "messages array is required" }, { status: 400 });
        }

        let systemPrompt = SYSTEM_PROMPT;
        if (cityContext?.city && cityContext?.aqi) {
            systemPrompt += `\n\nCurrent context: The user is viewing ${cityContext.city}, where the current AQI is ${cityContext.aqi}. Use this when relevant, but still answer other cities/questions if asked.`;
        }

        // Gemini expects "user"/"model" roles, not "user"/"assistant"
        const contents = messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
        }));

        const response = await generateWithFallback({
            contents,
            config: {
                systemInstruction: systemPrompt,
                maxOutputTokens: 400,
            },
        });

        const reply = response.text;

        return NextResponse.json({ success: true, reply });
    } catch (err) {
        console.error("POST /api/chat error:", err);

        const status = err?.status ?? err?.error?.code;
        const isOverloaded = status === 503;

        return NextResponse.json(
            {
                success: false,
                error: isOverloaded
                    ? "AirBot is a bit busy right now — please try again in a few seconds."
                    : "Failed to get response from AirBot",
            },
            { status: 500 }
        );
    }
}