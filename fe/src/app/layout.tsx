import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Sentiment Arena — TNGC | ABSA Decision Intelligence",
  description: "Aspect-Based Sentiment Analysis & LLM Decision Studio for Gunung Ciremai National Park",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${spaceMono.variable}`}>
      <body className="font-mono bg-[#f9f9f9] text-[#111111] antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
