import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Testimonials from "../components/Testimonials"; // 1. Importa el componente
import Categories from "../components/Categories";
import Products from "../components/Products";
import Footer from "../components/Footer";

export default function Home(){
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      
      <Categories />
      <Testimonials /> {/* 2. Colócalo aquí para que se muestre */}
      <Products />
      <Footer />
    </>
  );
}