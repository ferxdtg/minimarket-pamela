"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("todos");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
      const catList = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      
      // Ofertas primero, luego alfabético
      catList.sort((a, b) => {
        if (a.name.toLowerCase().includes("oferta")) return -1;
        if (b.name.toLowerCase().includes("oferta")) return 1;
        return a.name.localeCompare(b.name);
      });

      setCategories(catList);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar categorías:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Escuchar el evento de filtro para marcar la categoría activa
  useEffect(() => {
    const handleFilter = (e: CustomEvent) => {
      setActiveCategory(e.detail || "todos");
    };
    window.addEventListener("filter_category", handleFilter as EventListener);
    return () => window.removeEventListener("filter_category", handleFilter as EventListener);
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory(categoryName);
    window.dispatchEvent(new CustomEvent("filter_category", { detail: categoryName }));
    const section = document.getElementById("productos-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const getCategoryVisuals = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("oferta") || lower.includes("promo"))
      return { icon: "🔥", bg: "from-red-500 to-orange-400", ring: "ring-red-500" };
    if (lower.includes("abarrote") || lower.includes("despensa"))
      return { icon: "🍚", bg: "from-amber-400 to-orange-400", ring: "ring-amber-400" };
    if (lower.includes("bebida") || lower.includes("licor") || lower.includes("lácteo"))
      return { icon: "🥤", bg: "from-blue-400 to-cyan-400", ring: "ring-blue-400" };
    if (lower.includes("snack") || lower.includes("galleta") || lower.includes("dulce"))
      return { icon: "🍪", bg: "from-orange-400 to-amber-400", ring: "ring-orange-400" };
    if (lower.includes("limpieza") || lower.includes("hogar"))
      return { icon: "🧼", bg: "from-teal-400 to-emerald-400", ring: "ring-teal-400" };
    if (lower.includes("bebe") || lower.includes("bebé") || lower.includes("niño"))
      return { icon: "🍼", bg: "from-pink-400 to-rose-400", ring: "ring-pink-400" };
    if (lower.includes("mascota") || lower.includes("perro") || lower.includes("gato"))
      return { icon: "🐶", bg: "from-stone-400 to-gray-400", ring: "ring-stone-400" };
    if (lower.includes("cuidado") || lower.includes("personal") || lower.includes("salud"))
      return { icon: "🧴", bg: "from-purple-400 to-fuchsia-400", ring: "ring-purple-400" };
    if (lower.includes("juguete"))
      return { icon: "🧸", bg: "from-indigo-400 to-violet-400", ring: "ring-indigo-400" };
    return { icon: "🛍️", bg: "from-slate-400 to-gray-400", ring: "ring-slate-400" };
  };

  return (
    <section className="py-6 bg-white w-full overflow-hidden border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
            ¿Qué buscas hoy?
          </h2>
          <button
            onClick={() => handleCategoryClick("todos")}
            className="hidden md:flex items-center gap-1 text-red-600 font-bold text-xs hover:bg-red-50 px-3 py-1.5 rounded-full transition-all cursor-pointer"
          >
            Ver todo <span>→</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          </div>
        ) : (
          /* Scroll con degradado indicador */
          <div className="relative">
            {/* Degradado derecho que indica scroll */}
            <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none md:hidden" />
            
            <div className="flex overflow-x-auto pb-2 gap-4 sm:gap-6 snap-x snap-mandatory hide-scrollbar w-full">
              
              {/* Botón "Todos" */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleCategoryClick("todos")}
                onKeyDown={(e) => e.key === "Enter" && handleCategoryClick("todos")}
                className="flex flex-col items-center gap-2 snap-start cursor-pointer group shrink-0"
                aria-label="Ver todos los productos"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 p-[2px] shadow-sm group-hover:scale-105 transition-all duration-300 ${activeCategory === "todos" ? "ring-2 ring-offset-2 ring-slate-400 scale-105" : ""}`}>
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-xl sm:text-2xl border border-gray-100">
                    🏪
                  </div>
                </div>
                <span className={`text-[10px] sm:text-xs font-bold text-center w-20 sm:w-24 mt-1 transition-colors ${activeCategory === "todos" ? "text-slate-900" : "text-slate-600"}`}>
                  Todos
                </span>
              </div>

              {categories.map((cat) => {
                const visuals = getCategoryVisuals(cat.name);
                const isActive = activeCategory === cat.name;

                return (
                  <div
                    key={cat.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCategoryClick(cat.name)}
                    onKeyDown={(e) => e.key === "Enter" && handleCategoryClick(cat.name)}
                    className="flex flex-col items-center gap-2 snap-start cursor-pointer group shrink-0"
                    aria-label={`Filtrar por ${cat.name}`}
                    aria-pressed={isActive}
                  >
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr ${visuals.bg} p-[2px] shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300 ${isActive ? `ring-2 ring-offset-2 ${visuals.ring} scale-105` : ""}`}>
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-2xl sm:text-3xl border-[2px] border-white">
                        {visuals.icon}
                      </div>
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-bold transition-colors line-clamp-2 leading-tight text-center w-20 sm:w-24 mt-1 ${isActive ? "text-slate-900 font-black" : "text-slate-600"}`}>
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}