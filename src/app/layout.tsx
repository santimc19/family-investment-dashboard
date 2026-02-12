import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
        className={`${sans.variable} ${mono.variable} font-sans antialiased bg-[#09090b] text-zinc-100`}
      >
        <nav className="border-b border-zinc-800/50 bg-[#09090b]/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-[10px] font-bold text-black tracking-tight">FO</span>
              </div>
              <span className="font-semibold tracking-tight text-[15px] text-zinc-200 group-hover:text-white transition-colors">
                Family Office
              </span>
            </Link>
            <div className="flex items-center gap-1">
              {[
                { href: "/", label: "Portfolio" },
                { href: "/history", label: "History" },
                { href: "/audit", label: "Audit" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-1.5 text-[13px] font-medium text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
