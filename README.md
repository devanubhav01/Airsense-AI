# AirSense AI

**Instrument-grade air quality forecasting for Indian cities — powered by AI.**

AirSense AI is a full-stack air quality intelligence platform that delivers real-time AQI data, 7-day forecasts, pollution heatmaps, smart alerts, and AI-powered insights for 50+ Indian cities.

🎥 Demo Video

▶️ Watch AirSense AI Demo : https://drive.google.com/file/d/1-MGN4W5VSpoGCNGScyuDLtdq4wbRjeRR/view?usp=sharing




🔗 **Live Demo:**(https://airsense-ai-rho.vercel.app)

---

## ✨ Features

- **Live AQI Dashboard** — Real-time air quality data sourced from the WAQI (World Air Quality Index) API, covering 50+ Indian cities.
- **7-Day AQI Forecasting** — Predictive readouts modeled on historical and meteorological trends.
- **Pollution Heatmaps** — Zone-level PM2.5 / PM10 visualization, updated hourly.
- **Smart Alerts** — Threshold-based notifications the moment air quality crosses your risk band.
- **AI Chatbot — AirBot** — A Google Gemini-powered assistant that answers air quality and health-related queries in natural language.
- **Detailed PDF Reports** — On-demand, downloadable pollutant breakdowns with health guidance, generated via `@react-pdf/renderer`.
- **Secure Authentication** — Google & GitHub OAuth login via NextAuth.js.
- **Secure User Database** — User profiles and account information are securely stored in **MongoDB Atlas** using **Mongoose**, with data easily managed through **MongoDB Compass** during development.
- **Payments** — Integrated Razorpay for premium report/subscription purchases.
- **Email Delivery** — Automated report and alert delivery via Gmail SMTP.

---

## 🛠️ Tech Stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| Framework      | Next.js (App Router)                              |
| Styling        | Tailwind CSS                                       |
| Authentication | NextAuth.js (Google & GitHub OAuth)               |
| Database       | MongoDB Atlas                                      |
| ODM            | Mongoose                                           |
| Database Tool  | MongoDB Compass                                    |
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
<img width="1919" height="1029" alt="Screenshot 2026-08-19 011929" src="https://github.com/user-attachments/assets/190b618f-19c4-4ce2-a6cf-850113b6f22d" />

<img width="1917" height="1023" alt="Screenshot 2026-08-19 012037" src="https://github.com/user-attachments/assets/4a9b70c2-d36e-4dc2-bbda-504040e49694" />

<img width="1916" height="976" alt="Screenshot 2026-08-19 012053" src="https://github.com/user-attachments/assets/892a438e-b834-4bd7-902e-d89b7f8d44da" />

<img width="1919" height="1029" alt="Screenshot 2026-08-19 012244" src="https://github.com/user-attachments/assets/fc25aff7-cd2b-4d48-a795-4b1980f8807b" />

<img width="1595" height="891" alt="Screenshot 2026-08-19 012307" src="https://github.com/user-attachments/assets/46b0a61c-9573-449d-8c0e-eedd9a82542e" />

<img width="1917" height="1027" alt="Screenshot 2026-08-19 012014" src="https://github.com/user-attachments/assets/e511d45d-4b74-4339-9de0-17ec85a4b917" />

<img width="1533" height="966" alt="Screenshot 2026-08-19 014814" src="https://github.com/user-attachments/assets/9f9ea172-9b41-4386-9c45-ea7dddd5863d" />

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
