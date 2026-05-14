import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Financial AI Agent - Phase 1",
  description: "Phase 1 financial product recommendation mock frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
