import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Сургуулийн Онлайн Систем",
  description: "Оюутан, хичээл, элсэлтийн удирдлагын интерфейс",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mn"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-base text-main">
        <AppProviders>
          <div className="app-shell">
            <div className="content-column">
              <NavBar />
              <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
