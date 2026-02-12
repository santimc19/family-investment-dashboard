import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Family Office",
  description: "Family Investment Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${sans.variable} ${mono.variable} font-sans antialiased bg-zinc-950 text-zinc-100`}
      >
        <nav className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-semibold tracking-tight text-sm">
                Family Office
              </span>
            </Link>
            <div className="flex gap-6 text-sm text-zinc-500">
              <Link href="/" className="hover:text-white transition-colors">
                Portfolio
              </Link>
              <Link
                href="/history"
                className="hover:text-white transition-colors"
              >
                History
              </Link>
              <Link
                href="/audit"
                className="hover:text-white transition-colors"
              >
                Audit
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
