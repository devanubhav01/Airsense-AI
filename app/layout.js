import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { AlertProvider } from "@/components/AlertContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata = {
  title: "AirSense AI",
  description: "Predict air quality before it affects you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        <AuthProvider>
          <AlertProvider>
            <Header />
            {children}
            <Footer />
            <ChatWidget />
          </AlertProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
