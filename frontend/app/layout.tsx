import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Сургуулийн Онлайн Систем",
  description: "Оюутан, хичээл, элсэлтийн удирдлагын интерфейс",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full bg-[var(--bg-page)] text-[var(--text-primary)]">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
