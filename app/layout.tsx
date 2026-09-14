import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/lib/CartContext";
import { CartUIProvider } from "@/lib/CartUIContext";
import CartDrawer from "@/components/CartDrawer";
import CartNotificationWrapper from "@/components/CartNotificationWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Minimarket Pamela | Tu súper sin salir de casa",
  description: "Abarrotes, bebidas, lácteos y limpieza al mejor precio. Pide por delivery express o recojo en tienda y acumula Pamela Coins.",
  keywords: ["minimarket", "abarrotes", "delivery express", "compras lima", "Pamela Coins", "Minimarket Pamela"],
  metadataBase: new URL("https://minimarket-pamela.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pamela Market",
  },
  openGraph: {
    title: "🛒 Minimarket Pamela | Delivery Express ⚡",
    description: "Tu súper sin salir de casa. Pide tus abarrotes en segundos, paga seguro y acumula Pamela Coins para canjear descuentos.",
    url: "https://minimarket-pamela.vercel.app",
    siteName: "Minimarket Pamela",
    locale: "es_PE",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Catálogo y ofertas de Minimarket Pamela",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🛒 Minimarket Pamela | Delivery Express",
    description: "Pide tus víveres y abarrotes con entrega express a tu puerta.",
    images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop"],
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
          </CartUIProvider>
        </CartProvider>
      </body>
    </html>
  );
}