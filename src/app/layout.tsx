import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Assignment Tracker",
  description: "Jamie's personal assignment tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tracker",
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        <Navbar />
        <main className="pt-14 pb-20 sm:pb-8 max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
