import type { Metadata } from "next";
import { Cinzel, Spectral } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eldritch RPG GM Tools Suite",
  description: "Essential tools for Game Masters running Eldritch RPG campaigns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${spectral.variable} antialiased font-serif bg-obsidian text-silver`}
      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
