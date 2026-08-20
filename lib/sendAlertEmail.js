import nodemailer from "nodemailer";

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP email configuration is missing");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendAlertEmail({ to, city, aqi, type, message }) {
  const transporter = getTransporter();

  const subject =
    type === "severe"
      ? `AirSense AI severe air-quality warning · ${city}`
      : type === "daily"
        ? `AirSense AI daily AQI · ${city}`
        : `AirSense AI weekly air-quality summary · ${city}`;

  return transporter.sendMail({
    from: `"AirSense AI" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a">
        <h2>AirSense AI · ${city}</h2>
        <p style="font-size:18px"><strong>AQI ${aqi}</strong></p>
        <p style="color:#475569">${message}</p>
        <p style="color:#64748b;font-size:13px">This alert was generated from the user's AirSense notification preferences.</p>
      </div>
    `,
  });
}
