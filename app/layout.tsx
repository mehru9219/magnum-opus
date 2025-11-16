import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "Magnum Opus - AI-Powered Content Generation & GEO Platform",
  description: "Generate SEO/GEO-optimized content, publish to 10+ platforms, track AI visibility across ChatGPT, Claude, Perplexity, and Gemini",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
