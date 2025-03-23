import type { Metadata } from "next";
import { Geist, Geist_Mono, Pangolin } from "next/font/google";
import { AuthProvider } from "@/providers/NextAuthProviders";
import { ThemeProvider } from "@/providers/ThemeProviders";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pangolin = Pangolin({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pangolin",
});

export const metadata: Metadata = {
  title: "FocusUp",
  description: "A productivity app to help you focus on your tasks.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://focusup.vercel.app",
  ),
  openGraph: {
    title: "FocusUp",
    description: "A productivity app to help you focus on your tasks.",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "FocusUp App Banner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FocusUp",
    description: "A productivity app to help you focus on your tasks.",
    images: ["/banner.png"],
    creator: "@focusup",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pangolin.variable} font-pangolin`}
      >
        <AuthProvider>
          <ThemeProvider>
            {children}
            <SpeedInsights />
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
