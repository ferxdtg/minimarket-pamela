import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/lib/CartContext";
import { CartUIProvider } from "@/lib/CartUIContext";
import CartDrawer from "@/components/CartDrawer";
import CartNotificationWrapper from "@/components/CartNotificationWrapper";
import PWAInstallPrompt from "@/components/PWAInstallPrompt"; // 👈 Importar aquí

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pamela Market | Delivery Express ⚡",
  description: "Abarrotes, bebidas, lácteos y limpieza. Pide rápido y acumula Pamela Coins.",
  metadataBase: new URL("https://minimarket-pamela.vercel.app"),
  icons: {
    icon: "/productos/icon-192.png",
    shortcut: "/productos/icon-192.png",
    apple: "/productos/icon-192.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pamela Market",
  },
  openGraph: {
    title: "🛒 Pamela Market | Delivery Express ⚡",
    description: "Tu súper sin salir de casa. Pide tus abarrotes y acumula Pamela Coins.",
    url: "https://minimarket-pamela.vercel.app",
    siteName: "Pamela Market",
    locale: "es_PE",
    type: "website",
    images: [
      {
        url: "/productos/icon-192.png",
        width: 192,
        height: 192,
        alt: "Logo Pamela Market",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#DC2626",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <CartProvider>
          <CartUIProvider>
            {children}
            <CartDrawer />
            <CartNotificationWrapper />
            <PWAInstallPrompt /> {/* 👈 Renderizado global aquí */}
          </CartUIProvider>
        </CartProvider>
      </body>
    </html>
  );
}