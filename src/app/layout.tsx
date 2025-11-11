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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
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
                {/* Desktop nav: hidden on small screens to keep header compact */}
                <nav className="hidden sm:flex gap-1 sm:gap-2">
                <Link href="/" className="px-3 sm:px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all duration-200">
                  🏠 Home
                </Link>
                <Link href="/accounts" className="px-3 sm:px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all duration-200">
                  🏦 Accounts
                </Link>
                <Link href="/transactions" className="px-3 sm:px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all duration-200">
                  💳 Transactions
                </Link>
                <Link href="/reports" className="px-3 sm:px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all duration-200">
                  📊 Reports
                </Link>
              </nav>
                {/* Mobile: small title only (keeps header compact) */}
                <div className="sm:hidden text-white text-sm font-medium">Church Reports</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        {/* Main Content: constrained to a mobile-app width on small screens */}
        <main className="w-full max-w-md mx-auto px-4 py-8 pb-28 sm:pb-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white mt-16">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-300">
            <p>© 2025 Church Financial System. All rights reserved.</p>
          </div>
        </footer>
        {/* Mobile bottom navigation (visible only on small screens) */}
        <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-2 sm:hidden z-50">
          <div className="flex items-center justify-between gap-3 px-2">
            <Link href="/" className="flex flex-col items-center text-slate-700 text-xs px-3 py-2 hover:bg-slate-100 rounded-lg">
              <span className="text-lg">🏠</span>
              <span>Home</span>
            </Link>
            <Link href="/accounts" className="flex flex-col items-center text-slate-700 text-xs px-3 py-2 hover:bg-slate-100 rounded-lg">
              <span className="text-lg">🏦</span>
              <span>Accounts</span>
            </Link>
            <Link href="/transactions" className="flex flex-col items-center text-slate-700 text-xs px-3 py-2 hover:bg-slate-100 rounded-lg">
              <span className="text-lg">💳</span>
              <span>Tx</span>
            </Link>
            <Link href="/reports" className="flex flex-col items-center text-slate-700 text-xs px-3 py-2 hover:bg-slate-100 rounded-lg">
              <span className="text-lg">📊</span>
              <span>Reports</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
