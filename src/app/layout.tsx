import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { Toaster } from "@/components/ui/sonner";
import { PinGate } from "@/components/pin/PinGate";
import { BottomNav } from "@/components/nav/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ApiKeySettings } from "@/components/ApiKeySettings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Next's Metadata API doesn't prefix icon/apple URLs with `basePath` the way
// it does for JS/CSS assets, so on a GitHub Pages project site (served under
// /repo-name/) these would 404 without this manual prefix — breaking PWA
// installability (Chrome can't validate a manifest whose icons don't load).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Expenses",
  description: "A calm, fast personal expense tracker.",
  manifest: "manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Expenses",
  },
  icons: {
    icon: [
      { url: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${basePath}/icons/apple-touch-icon.png`, sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Legacy iOS Safari standalone-mode tag; Next's appleWebApp metadata
            only emits the newer unprefixed "mobile-web-app-capable" tag. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ServiceWorkerRegister />
        <PinGate>
          <div className="flex min-h-screen flex-col pb-20">
            <header className="flex items-center justify-end gap-1 px-4 pt-3">
              <ApiKeySettings />
              <ThemeToggle />
            </header>
            {children}
          </div>
          <BottomNav />
        </PinGate>
        <Toaster />
      </body>
    </html>
  );
}
