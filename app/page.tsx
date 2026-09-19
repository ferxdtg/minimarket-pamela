import TopBanner from "@/components/TopBanner";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Products from "@/components/Products";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-red-600 selection:text-white overflow-x-hidden w-full max-w-[100vw]">
      
      <TopBanner />
      <Navbar />

      <main className="flex-1 flex flex-col w-full">
        <Hero />
        <Categories />
        <Products />
        <Features />
        <Testimonials />
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}