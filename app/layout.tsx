import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Magnum Opus - AI-Powered Content Generation & GEO Platform",
  description: "Generate SEO/GEO-optimized content, publish to 10+ platforms, and track AI visibility across ChatGPT, Claude, Perplexity, and Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
