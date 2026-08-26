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

// 🔥 1. METADATA PWA (App Instalable)
export const metadata: Metadata = {
  title: "Pamela Market",
  description: "Minimarket online",
  manifest: "/manifest.json", // Enlace automático al manifest que creamos
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pamela Market",
  },
};

// 🔥 2. COLOR DE LA BARRA DEL CELULAR
export const viewport: Viewport = {
  themeColor: "#DC2626", // Barra de estado roja en el móvil
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        {/* Proveedores de estado */}
        <CartProvider>
          <CartUIProvider>
            
            {/* Contenido principal de la web */}
            {children}

            {/* Elementos globales */}
            <CartDrawer />
            <CartNotificationWrapper />
            
          </CartUIProvider>
        </CartProvider>
      </body>
    </html>
  );
}