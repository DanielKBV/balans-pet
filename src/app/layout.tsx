import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OfflineBanner, ServiceWorkerRegister } from "@/components/service-worker";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Balans",
  description: "Онлайн-тетрадь доходов и расходов для небольшого бизнеса",
  // iPhone: full screen from the home screen, name under the icon.
  appleWebApp: { capable: true, title: "Balans", statusBarStyle: "default" },
};

// Matches --background in globals.css for each system theme.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F7F9" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0F12" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only rounded-lg bg-popover px-4 py-2 shadow-popover focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
        >
          Перейти к содержимому
        </a>
        <ThemeProvider>
          <OfflineBanner />
          {children}
          <Toaster />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
