import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "raxti.app — Turn your audio into actionable insights",
  description: "Upload audio, get transcripts, summaries, and action items instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
      <GoogleAnalytics gaId="G-TRJFKB4ML2" />
    </html>
  );
}
