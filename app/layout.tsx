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



export const metadata: Metadata = {

  title:"Pamela Market",

  description:"Minimarket online"

};





export default function RootLayout({

  children,

}: Readonly<{

  children:React.ReactNode;

}>) {


return (

<html lang="es">

<body
className="
min-h-screen
"
>


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