import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "AirSense AI",
  description: "Predict air quality before it affects you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}