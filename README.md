# 🌫️ AirSense AI

**Instrument-grade air quality forecasting for Indian cities — powered by AI.**

AirSense AI is a full-stack air quality intelligence platform that delivers real-time AQI data, 7-day forecasts, pollution heatmaps, smart alerts, and AI-powered insights for 50+ Indian cities.

🔗 **Live Demo:** [airsense-ai-wqur-fawn.vercel.app](https://airsense-ai-rho.vercel.app)

---

## ✨ Features

- **Live AQI Dashboard** — Real-time air quality data sourced from the WAQI (World Air Quality Index) API, covering 50+ Indian cities.
- **7-Day AQI Forecasting** — Predictive readouts modeled on historical and meteorological trends.
- **Pollution Heatmaps** — Zone-level PM2.5 / PM10 visualization, updated hourly.
- **Smart Alerts** — Threshold-based notifications the moment air quality crosses your risk band.
- **AI Chatbot — AirBot** — A Google Gemini-powered assistant that answers air quality and health-related queries in natural language.
- **Detailed PDF Reports** — On-demand, downloadable pollutant breakdowns with health guidance, generated via `@react-pdf/renderer`.
- **Secure Authentication** — Google & GitHub OAuth login via NextAuth.js.
- **Payments** — Integrated Razorpay for premium report/subscription purchases.
- **Email Delivery** — Automated report and alert delivery via Gmail SMTP.

---

## 🛠️ Tech Stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| Framework      | Next.js (App Router)                              |
| Styling        | Tailwind CSS                                       |
| Authentication | NextAuth.js (Google & GitHub OAuth)               |
| AI / Chatbot   | Google Gemini API                                  |
| Air Quality Data | WAQI API                                         |
| Payments       | Razorpay                                           |
| PDF Reports    | `@react-pdf/renderer`                              |
| Email Service  | Gmail SMTP (Nodemailer)                            |
| Deployment     | Vercel                                             |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- API keys for WAQI, Google Gemini, Razorpay, and Google/GitHub OAuth apps

### Installation

```bash
# Clone the repository
git clone https://github.com/devanubhav01/airsense-ai.git
cd airsense-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```
### Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📁 Project Structure

```
airsense-ai/
├── app/                  # Next.js App Router pages
├── components/           # Reusable UI components (Header, Footer, Gauge, etc.)
├── lib/                  # Utility functions & data helpers
├── public/               # Static assets (images, signature, icons)
├── styles/                # Global styles
└── .env.local             # Environment variables (not committed)
```

---

## 📸 Screenshots

> Add dashboard, forecast, and report screenshots here for a stronger visual overview.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**Anubhav Singh**

- GitHub: [@devanubhav01](https://github.com/devanubhav01)

---

<p align="center">Made with care for cleaner, more informed cities.</p>
