"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🚀 CONEXIÓN EN TIEMPO REAL CON FIREBASE INTACTA
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
      const catList = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      
      // Ordenar alfabéticamente, pero dejando "Ofertas" primero si existe
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

  // 🎯 FILTRO AL HACER CLIC INTACTO
  const handleCategoryClick = (categoryName: string) => {
    window.dispatchEvent(new CustomEvent("filter_category", { detail: categoryName }));
    const section = document.getElementById("productos-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  // 🎨 ASIGNADOR AUTOMÁTICO ADAPTADO PARA EL "ARO" ESTILO INSTAGRAM
  const getCategoryVisuals = (name: string) => {
    const lower = name.toLowerCase();
    
    if (lower.includes("oferta") || lower.includes("promo")) 
      return { icon: "🔥", desc: "Súper promos", bg: "from-red-500 to-orange-400", text: "group-hover:text-red-600" };
    if (lower.includes("abarrote") || lower.includes("despensa")) 
      return { icon: "🍚", desc: "Lo esencial", bg: "from-amber-400 to-orange-400", text: "group-hover:text-amber-600" };
    if (lower.includes("bebida") || lower.includes("licor") || lower.includes("lácteo")) 
      return { icon: "🥤", desc: "Refrescos y más", bg: "from-blue-400 to-cyan-400", text: "group-hover:text-blue-600" };
    if (lower.includes("snack") || lower.includes("galleta") || lower.includes("dulce")) 
      return { icon: "🍪", desc: "Para el antojo", bg: "from-orange-400 to-amber-400", text: "group-hover:text-orange-600" };
    if (lower.includes("limpieza") || lower.includes("hogar")) 
      return { icon: "🧼", desc: "Hogar impecable", bg: "from-teal-400 to-emerald-400", text: "group-hover:text-teal-600" };
    if (lower.includes("bebe") || lower.includes("bebé") || lower.includes("niño")) 
      return { icon: "🍼", desc: "Para los peques", bg: "from-pink-400 to-rose-400", text: "group-hover:text-pink-600" };
    if (lower.includes("mascota") || lower.includes("perro") || lower.includes("gato")) 
      return { icon: "🐶", desc: "Engreídos", bg: "from-stone-400 to-gray-400", text: "group-hover:text-stone-600" };
    if (lower.includes("cuidado") || lower.includes("personal") || lower.includes("salud")) 
      return { icon: "🧴", desc: "Salud y belleza", bg: "from-purple-400 to-fuchsia-400", text: "group-hover:text-purple-600" };
    if (lower.includes("juguete")) 
      return { icon: "🧸", desc: "Diversión", bg: "from-indigo-400 to-violet-400", text: "group-hover:text-indigo-600" };
    
    // Categoría genérica si no coincide con ninguna palabra clave
    return { icon: "🛍️", desc: "Variedad", bg: "from-slate-400 to-gray-400", text: "group-hover:text-slate-600" };
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
          <div className="flex overflow-x-auto pb-2 gap-4 snap-x snap-mandatory hide-scrollbar w-full">
            
            {/* Botón de "Todos" fijo al inicio */}
            <div 
              onClick={() => handleCategoryClick("todos")}
              className="flex flex-col items-center gap-1.5 snap-start cursor-pointer group shrink-0"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 p-[2px] shadow-sm group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-xl sm:text-2xl border border-gray-100">
                  🏪
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-600 group-hover:text-slate-900 line-clamp-1 text-center w-16 sm:w-20">Todos</span>
            </div>

            {/* Categorías mapeadas desde Firebase */}
            {categories.map((cat) => {
              const visuals = getCategoryVisuals(cat.name);

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex flex-col items-center gap-1.5 snap-start cursor-pointer group shrink-0"
                >
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr ${visuals.bg} p-[2px] shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300`}>
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-2xl sm:text-3xl border-[2px] border-white">
                      {visuals.icon}
                    </div>
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold text-slate-600 transition-colors line-clamp-1 text-center w-16 sm:w-20 ${visuals.text}`}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}