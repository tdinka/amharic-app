import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav, SiteHeader } from "@/components/SiteHeader";
import { displayFont, ethiopicFont, latinFont } from "@/lib/fonts";
import { ProgressProvider } from "@/lib/progress/ProgressProvider";

export const metadata: Metadata = {
  title: "Learn Amharic",
  description: "Short daily lessons to read, write and speak Amharic.",
  appleWebApp: { capable: true, title: "Amharic", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#FAF5EC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${ethiopicFont.variable} ${latinFont.variable} ${displayFont.variable}`}>
      <body className="min-h-screen font-sans">
        <ProgressProvider>
          <SiteHeader />
          {children}
          <BottomNav />
        </ProgressProvider>
      </body>
    </html>
  );
}
