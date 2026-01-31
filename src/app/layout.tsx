import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneSub",
  description: "Subscription Management",
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <AuthProvider>
          <CurrencyProvider>
            <div className="flex min-h-screen flex-col">
              <div className="flex-1">
                {children}
              </div>
              <footer className="py-8 text-center text-sm text-zinc-600 border-t border-white/5 bg-black">
                <p>&copy; 2026 OneSub. Tous droits réservés. Mentions légales.</p>
              </footer>
            </div>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
