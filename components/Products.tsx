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

  useEffect(() => {
    setMounted(true);

    // Conexión en tiempo real con Firestore
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
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
      }
    };
    window.addEventListener("search_product", handleSearchProduct as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener("filter_category", handleFilterCategory as EventListener);
      window.removeEventListener("search_product", handleSearchProduct as EventListener);
    };
  }, []);

  // Formatear datos manteniendo números estrictos para precios y stock
  const formattedProducts = products.map((p) => ({
    id: String(p.id),
    name: p.name || "",
    price: typeof p.price === "number" ? p.price : parseFloat(p.price || 0),
    stock: typeof p.stock === "number" ? p.stock : parseInt(p.stock || 0),
    image: p.image && p.image.trim() !== "" ? p.image : "/placeholder.png",
    category: p.category ? p.category.toLowerCase().trim() : "abarrotes",
    isFeatured: Boolean(p.isFeatured),
    isOnSale: Boolean(p.isOnSale),
  }));

  const filteredProducts = formattedProducts.filter((p) => {
    const matchesCategory =
      selectedCategory === "todos"
        ? true
        : selectedCategory === "ofertas"
        ? p.isOnSale
        : p.category === selectedCategory;

    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery)
      : true;

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="productos-section" className="max-w-7xl mx-auto py-12 px-6 scroll-mt-10">
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

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
          <p className="text-lg font-bold text-zinc-400">No encontramos productos en esta sección.</p>
          <p className="text-xs text-zinc-600 mt-1">Intenta con otra categoría o término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mounted &&
            filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      )}
    </section>
  );
}