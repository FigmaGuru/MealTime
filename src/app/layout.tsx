import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { ServiceWorkerRegistration } from "@/components/pwa/sw-registration";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const APP_NAME = "MealTime";
const APP_DESCRIPTION =
  "Help your family plan meals fast, reuse favourites, and generate a clean weekly plan.";
const APP_URL = "https://figmaguru.github.io/MealTime";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: "MealTime — Plan your meals, simplify your week",
    template: "%s | MealTime",
  },
  description: APP_DESCRIPTION,
  manifest: "/MealTime/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: "MealTime — Plan your meals, simplify your week",
    description: APP_DESCRIPTION,
    url: APP_URL,
    images: [{ url: `${APP_URL}/icons/icon-512x512.png`, width: 512, height: 512, alt: "MealTime" }],
  },
  twitter: {
    card: "summary",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/icons/icon-512x512.png`],
  },
  icons: {
    icon: [
      { url: "/MealTime/icons/icon-48x48.png",   sizes: "48x48",   type: "image/png" },
      { url: "/MealTime/icons/icon-96x96.png",   sizes: "96x96",   type: "image/png" },
      { url: "/MealTime/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/MealTime/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/MealTime/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MealTime" />
        <link rel="apple-touch-icon" href="/MealTime/icons/apple-touch-icon.png" />
        {/* Android / Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </AuthProvider>
        </ThemeProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
