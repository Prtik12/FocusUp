import type { Metadata } from "next";
import { Geist, Geist_Mono, Pangolin } from "next/font/google";
import { AuthProvider } from "@/providers/NextAuthProviders";
import { ThemeProvider } from "@/providers/ThemeProviders";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${pangolin.variable} font-pangolin`}>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
