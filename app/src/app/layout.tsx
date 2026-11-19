import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { OfflineBanner, ServiceWorkerManager } from "@/components/shell/status-banners";
import { ToastProvider } from "@/components/ui/toast";
import { THEME_COOKIE, themeFromCookie } from "@/server/modules/preferences/theme";
import "./globals.css";

// TD-22: self-hosted at build time; no runtime third-party font requests.
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Retenum", template: "%s · Retenum" },
  description: "A shared commercial record: what was agreed, changed, authorised, delivered and paid.",
  applicationName: "Retenum",
  appleWebApp: { capable: true, title: "Retenum", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0e" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // DES-03: the server renders the saved theme so the first paint is correct (no flash).
  const theme = themeFromCookie((await cookies()).get(THEME_COOKIE)?.value);
  const swEnabled = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENABLE_SW === "1";
  return (
    <html lang="en" data-theme={theme} className={plex.variable} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-control focus:bg-action focus:px-3 focus:py-2 focus:text-action-fg">
          Skip to content
        </a>
        <OfflineBanner />
        <ToastProvider>{children}</ToastProvider>
        <ServiceWorkerManager enabled={swEnabled} />
      </body>
    </html>
  );
}
