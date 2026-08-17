import TopBanner from "@/components/TopBanner";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Products from "@/components/Products";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CartDrawer from "@/components/CartDrawer";
import CartNotificationWrapper from "@/components/CartNotificationWrapper";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#09090b] flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* 1. BANNER SUPERIOR DE OFERTAS (Z-50 para que quede arriba de todo) */}
      <TopBanner />

      {/* 2. NAVEGACIÓN PRINCIPAL (Pegajosa/Sticky en la parte superior) */}
      <Navbar />

      {/* 3. CONTENIDO PRINCIPAL DE LA PÁGINA */}
      <main className="flex-1 flex flex-col w-full">
        
        {/* Sección Hero: Llamado a la acción inicial */}
        <Hero />

        {/* Sección de Filtros rápidos por Categoría */}
        <Categories />

        {/* Catálogo de Productos (Conectado a Firebase) */}
        <Products />

        {/* Beneficios de la tienda (Delivery, GPS, Pagos) */}
        <Features />

        {/* Nivel Pro: Testimonios de confianza vecinal */}
        <Testimonials />

      </main>

      {/* 4. FOOTER */}
      <Footer />

      {/* =========================================
          ELEMENTOS FLOTANTES (OVERLAYS / MODALS)
          ========================================= */}

      {/* Botón flotante de WhatsApp (Inferior derecho) */}
      <FloatingWhatsApp />

      {/* Cajón lateral del carrito de compras */}
      <CartDrawer />

      {/* Notificaciones animadas de "Producto agregado" */}
      <CartNotificationWrapper />

    </div>
  );
}