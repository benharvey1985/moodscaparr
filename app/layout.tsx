import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"
import { FABButton } from "@/components/feedback/fab-button"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Moodscaparr",
  description: "Track your daily moods and discover patterns",
  icons: {
    icon: "/favicon.svg",
    apple: "/app-icon.svg",
  },
  openGraph: {
    title: "Moodscaparr",
    description: "Track your daily moods and discover patterns",
    siteName: "Moodscaparr",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <Toaster>
              {children}
            </Toaster>
            <FABButton />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
