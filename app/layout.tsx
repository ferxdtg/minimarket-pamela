import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/lib/CartContext";
import { CartUIProvider } from "@/lib/CartUIContext";

import CartDrawer from "@/components/CartDrawer";
import CartNotificationWrapper from "@/components/CartNotificationWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets:["latin"],
});

const geistMono = Geist_Mono({
  variable:"--font-geist-mono",
  subsets:["latin"],
});

// 🚀 METADATA PRO: SEO Y TARJETAS PARA WHATSAPP / REDES SOCIALES
export const metadata = {
  title: "Pamela Market - Delivery Express",
  description: "Tu súper, sin salir de casa.",
  manifest: "/manifest.json",
  themeColor: "#dc2626",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pamela Market",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children:React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <CartProvider>
          <CartUIProvider>
            
            {children}

            {/* Modales globales de la tienda */}

            <CartNotificationWrapper />
            
          </CartUIProvider>
        </CartProvider>
      </body>
    </html>
  );
}