"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import SectionTitle from "./SectionTitle";

const defaultProducts = [
  { id: 101, name: "Arroz Costeño", price: 5.90, stock: 50, category: "abarrotes", isOnSale: false, isFeatured: true, image: "/productos/arrozcosteno.jpg", salesCount: 120 },
  { id: 102, name: "Leche Gloria", price: 4.50, stock: 30, category: "abarrotes", isOnSale: false, isFeatured: true, image: "/productos/lechegloria.jpg", salesCount: 120 },
  { id: 103, name: "Sopa Maruchan", price: 6.90, stock: 25, category: "snacks", isOnSale: false, isFeatured: true, image: "/productos/maruchan.jpg", salesCount: 120 },
  { id: 104, name: "Bizcocho Bimbo", price: 7.50, stock: 20, category: "snacks", isOnSale: false, isFeatured: true, image: "/productos/bizcochobimbo.jpg", salesCount: 120 },
];

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const loadProducts = () => {
      const saved = localStorage.getItem("minimarket_products");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProducts(parsed);
        } catch (e) {
          setProducts(defaultProducts);
        }
      } else {
        setProducts(defaultProducts);
        localStorage.setItem("minimarket_products", JSON.stringify(defaultProducts));
      }
    };

    loadProducts();

    window.addEventListener("storage", loadProducts);
    window.addEventListener("product_added", loadProducts);

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
      window.removeEventListener("storage", loadProducts);
      window.removeEventListener("product_added", loadProducts);
      window.removeEventListener("filter_category", handleFilterCategory as EventListener);
      window.removeEventListener("search_product", handleSearchProduct as EventListener);
    };
  }, []);

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: typeof p.price === "number" ? p.price.toFixed(2) : p.price,
    image: p.image && p.image.trim() !== "" ? p.image : "/placeholder.png",
    category: p.category ? p.category.toLowerCase().trim() : "abarrotes",
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
    <section id="productos-section" className="max-w-7xl mx-auto py-20 px-6 scroll-mt-10">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
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
            className="text-xs font-black bg-red-100 text-red-600 px-5 py-2.5 rounded-full hover:bg-red-200 transition self-start md:self-auto cursor-pointer"
          >
            Ver todos los productos ✕
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
          <p className="text-xl font-bold text-gray-700">No encontramos productos en esta sección.</p>
          <p className="text-sm text-gray-500 mt-1">Intenta con otra categoría o término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mounted &&
            filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                image={p.image}
              />
            ))}
        </div>
      )}

    </section>
  );
}