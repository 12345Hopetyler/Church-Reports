import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Church Reports",
  description: "Simple church financial reports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 shadow-lg border-b-4 border-indigo-800">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-indigo-600 font-bold text-lg">💰</span>
                </div>
                <span className="font-bold text-xl text-white hidden sm:inline">Church Reports</span>
              </Link>
              <nav className="flex gap-1 sm:gap-2">
                <Link href="/" className="px-3 sm:px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all duration-200">
                   Home
                </Link>
                <Link href="/accounts" className="px-3 sm:px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all duration-200">
                   Accounts
                </Link>
                <Link href="/transactions" className="px-3 sm:px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all duration-200">
                   Transactions
                </Link>
                <Link href="/reports" className="px-3 sm:px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all duration-200">
                   Reports
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white mt-16">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-300">
            <p>© 2025 Church Financial System. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
