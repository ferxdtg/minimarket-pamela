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
    <div className="relative min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* 1. BANNER SUPERIOR DINÁMICO (Conectado a Firebase) */}
      <TopBanner />

      {/* 2. NAVEGACIÓN PRINCIPAL (Pegajosa y con buscador) */}
      <Navbar />

      {/* 3. CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col w-full">
        
        {/* Llamado a la acción principal */}
        <Hero />

        {/* Filtros por Categoría */}
        <Categories />

        {/* Catálogo en tiempo real */}
        <Products />

        {/* Beneficios (Delivery, Pagos) */}
        <Features />

        {/* Confianza Vecinal (Testimonios) */}
        <Testimonials />

      </main>

      {/* 4. PIE DE PÁGINA */}
      <Footer />

      {/* =========================================
          OVERLAYS Y ELEMENTOS FLOTANTES
          ========================================= */}

      {/* Botón flotante de WhatsApp (Inferior derecho) */}
      <FloatingWhatsApp />

      {/* Cajón lateral del carrito de compras */}
      <CartDrawer />

      {/* Notificaciones animadas */}
      <CartNotificationWrapper />

    </div>
  );
}