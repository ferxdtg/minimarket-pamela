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
export const metadata: Metadata = {
  title: "Minimarket Pamela | Tu tienda de confianza",
  description: "Pide tus abarrotes, bebidas, lácteos y productos de limpieza por delivery o recojo en tienda. ¡Rápido, seguro y cerca de ti!",
  keywords: ["minimarket", "abarrotes", "delivery", "compras", "víveres", "Pamela"],
  openGraph: {
    title: "🛒 Minimarket Pamela | Delivery Express",
    description: "Aprovecha nuestras ofertas de la semana. Pide tus abarrotes fácilmente y recíbelos en la puerta de tu casa.",
    url: "https://minimarket-pamela.vercel.app", // Reemplaza por tu dominio final si lo cambias
    siteName: "Minimarket Pamela",
    images: [
      {
        // Imagen que saldrá al compartir el link en WhatsApp
        url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop", 
        width: 1200,
        height: 630,
        alt: "Portada de Minimarket Pamela",
      },
    ],
    locale: "es_PE", // Ubicación Perú
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🛒 Minimarket Pamela | Delivery",
    description: "Pide tus abarrotes fácilmente y recíbelos en la puerta de tu casa hoy mismo.",
    images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop"],
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
            <CartDrawer />
            <CartNotificationWrapper />
            
          </CartUIProvider>
        </CartProvider>
      </body>
    </html>
  );
}