"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import ProductCard from "./ProductCard";
import SectionTitle from "./SectionTitle";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
      setLoading(false);
    });

    const handleFilterCategory = (e: any) => {
      if (e.detail) {
        setSelectedCategory(e.detail.toLowerCase().trim());
        setSearchQuery("");
      }
    };
    window.addEventListener("filter_category", handleFilterCategory as EventListener);

    const handleSearchProduct = (e: any) => {
      if (e.detail !== undefined) {
        setSearchQuery(e.detail.toLowerCase().trim());
        setSelectedCategory("todos");
        const section = document.getElementById("productos-section");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("search_product", handleSearchProduct as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener("filter_category", handleFilterCategory as EventListener);
      window.removeEventListener("search_product", handleSearchProduct as EventListener);
    };
  }, []);

  if (!mounted) return null;

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "todos" || product.category?.toLowerCase() === selectedCategory;
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery) || product.sku?.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="productos-section" className="py-12 px-2 sm:px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 px-2 sm:px-0">
        <SectionTitle
          title={
            searchQuery
              ? `Buscando: "${searchQuery}"`
              : selectedCategory === "todos"
              ? "Nuestros Productos"
              : `Categoría: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
          }
          subtitle="Calidad y frescura directa a tu hogar"
        />
        
        {(selectedCategory !== "todos" || searchQuery !== "") && (
          <button
            onClick={() => {
              setSelectedCategory("todos");
              setSearchQuery("");
            }}
            className="text-xs font-black bg-red-50 text-red-600 border border-red-100 px-6 py-3 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm self-start md:self-auto cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <span>Ver todo el catálogo</span>
            <span className="bg-red-600/10 rounded-full w-5 h-5 flex items-center justify-center">✕</span>
          </button>
        )}
      </div>

      {loading ? (
        // 🔥 INYECCIÓN: grid-cols-2 en móviles para los esqueletos
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 px-1 sm:px-0">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] p-3 sm:p-5 flex flex-col h-full animate-pulse shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="w-full aspect-square bg-slate-100 rounded-xl sm:rounded-2xl mb-4"></div>
              <div className="w-3/4 h-4 sm:h-5 bg-slate-200 rounded-full mb-3"></div>
              <div className="w-1/2 h-3 sm:h-4 bg-slate-100 rounded-full mb-6"></div>
              <div className="w-full h-10 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl mt-auto"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm mx-2 sm:mx-0">
          <div className="text-6xl mb-4 opacity-50">🛒</div>
          <p className="text-xl font-black text-slate-800 tracking-tight">No encontramos lo que buscas.</p>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Quizás escribiste mal el nombre o este producto está agotado temporalmente.</p>
          <button 
            onClick={() => { setSelectedCategory("todos"); setSearchQuery(""); }}
            className="mt-6 px-8 py-3 bg-slate-900 text-white font-black rounded-full hover:bg-black transition-colors cursor-pointer active:scale-95 shadow-lg"
          >
            Volver al inicio
          </button>
        </div>
      ) : (
        // 🔥 INYECCIÓN: grid-cols-2 en móviles para el catálogo real
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 px-1 sm:px-0">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}