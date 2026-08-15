import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendReportEmail({ to, city, aqi, pdfBuffer }) {
    return await transporter.sendMail({
        from: `"AirSense AI" <${process.env.SMTP_USER}>`,
        to,
        subject: `Your ${city} Air Quality Report is ready`,
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1E293B;">Your ${city} report is ready 🌫️</h2>
        <p style="color: #64748B;">Current AQI: <strong style="color:#1E293B;">${aqi}</strong></p>
        <p style="color: #64748B;">Full 7-day forecast and pollutant breakdown is attached as a PDF.</p>
        <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">— AirSense AI</p>
      </div>
    `,
        attachments: [
            {
                filename: `AirSense-${city}-Report.pdf`,
                content: pdfBuffer,
            },
        ],
    });
}