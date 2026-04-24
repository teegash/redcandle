import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/ui/site-header";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://redcandle.app"),
  title: {
    default: "RedCandle",
    template: "%s | RedCandle",
  },
  description:
    "Premium signal intelligence with Telegram distribution, pip analytics, and a dark pro trading interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${mono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full">
        <div className="background-mesh" aria-hidden="true" />
        <div className="relative min-h-screen">
          <SiteHeader />
          <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-24 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
