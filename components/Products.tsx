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
  
  // 🚀 NUEVO: Estado de carga para los Skeletons
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Conexión en tiempo real con Firestore
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
      setLoading(false); // ✨ APAGAMOS LA CARGA AL RECIBIR LOS DATOS
    });

    // Escuchadores de eventos globales para categorías y búsquedas
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
    <section id="productos-section" className="py-12 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <SectionTitle
          title={
            searchQuery
              ? `Resultado para: "${searchQuery}"`
              : selectedCategory === "todos"
              ? "Productos Destacados"
              : `Categoría: ${selectedCategory.toUpperCase()}`
          }
          subtitle="Las mejores ofertas para tu hogar"
        />
        {(selectedCategory !== "todos" || searchQuery !== "") && (
          <button
            onClick={() => {
              setSelectedCategory("todos");
              setSearchQuery("");
            }}
            className="text-xs font-black bg-red-600/20 text-red-500 border border-red-600/30 px-5 py-2.5 rounded-full hover:bg-red-600/30 transition self-start md:self-auto cursor-pointer"
          >
            Ver todos los productos ✕
          </button>
        )}
      </div>

      {/* 🚀 RENDERIZADO CONDICIONAL DE SKELETONS O PRODUCTOS */}
      {loading ? (
        // 1. ESTADO DE CARGA: SKELETONS ANIMADOS (Shimmer effect)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
              <div className="w-full aspect-square bg-gray-200 rounded-2xl mb-4"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded-full mb-2"></div>
              <div className="w-1/2 h-3 bg-gray-200 rounded-full mb-4"></div>
              <div className="w-1/3 h-5 bg-gray-200 rounded-full mt-auto mb-3"></div>
              <div className="w-full h-10 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        // 2. ESTADO VACÍO (No se encontraron productos)
        <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
          <p className="text-lg font-bold text-zinc-400">No encontramos productos en esta sección.</p>
          <p className="text-xs text-zinc-600 mt-1">Intenta con otra categoría o término de búsqueda.</p>
        </div>
      ) : (
        // 3. CATÁLOGO REAL (Tus productos cargados)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}