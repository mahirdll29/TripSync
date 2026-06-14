import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "TripSync — Plan Group Trips Together",
  description:
    "Collaborative hotel discovery and trip planning platform. Organize hotel recommendations by trip and city, maintain personal shortlists, and share links — all in one place.",
  keywords: ["trip planning", "group travel", "hotel booking", "travel collaboration"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
