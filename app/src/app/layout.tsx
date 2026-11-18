import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retenum",
  description: "A shared commercial record: what was agreed, changed, authorised, delivered and paid.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-2">
          Skip to content
        </a>
        <main id="main" className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
