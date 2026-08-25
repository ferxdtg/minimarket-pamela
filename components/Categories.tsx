"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🚀 CONEXIÓN EN TIEMPO REAL CON FIREBASE
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

  // 🎯 FILTRO AL HACER CLIC
  const handleCategoryClick = (categoryName: string) => {
    window.dispatchEvent(new CustomEvent("filter_category", { detail: categoryName }));
    const section = document.getElementById("productos-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  // 🎨 ASIGNADOR AUTOMÁTICO DE DISEÑO SEGÚN EL NOMBRE
  const getCategoryVisuals = (name: string) => {
    const lower = name.toLowerCase();
    
    if (lower.includes("oferta") || lower.includes("promo")) 
      return { icon: "🔥", desc: "Súper promos", bg: "bg-red-50 text-red-600 border-red-100" };
    if (lower.includes("abarrote") || lower.includes("despensa")) 
      return { icon: "🍚", desc: "Lo esencial", bg: "bg-amber-50 text-amber-600 border-amber-100" };
    if (lower.includes("bebida") || lower.includes("licor") || lower.includes("lácteo")) 
      return { icon: "🥤", desc: "Refrescos y más", bg: "bg-blue-50 text-blue-600 border-blue-100" };
    if (lower.includes("snack") || lower.includes("galleta") || lower.includes("dulce")) 
      return { icon: "🍪", desc: "Para el antojo", bg: "bg-orange-50 text-orange-600 border-orange-100" };
    if (lower.includes("limpieza") || lower.includes("hogar")) 
      return { icon: "🧼", desc: "Hogar impecable", bg: "bg-teal-50 text-teal-600 border-teal-100" };
    if (lower.includes("bebe") || lower.includes("bebé") || lower.includes("niño")) 
      return { icon: "🍼", desc: "Para los peques", bg: "bg-pink-50 text-pink-600 border-pink-100" };
    if (lower.includes("mascota") || lower.includes("perro") || lower.includes("gato")) 
      return { icon: "🐶", desc: "Engreídos", bg: "bg-stone-50 text-stone-600 border-stone-100" };
    if (lower.includes("cuidado") || lower.includes("personal") || lower.includes("salud")) 
      return { icon: "🧴", desc: "Salud y belleza", bg: "bg-purple-50 text-purple-600 border-purple-100" };
    if (lower.includes("juguete")) 
      return { icon: "🧸", desc: "Diversión", bg: "bg-indigo-50 text-indigo-600 border-indigo-100" };
    
    // Categoría genérica si no coincide con ninguna palabra clave
    return { icon: "🛍️", desc: "Variedad", bg: "bg-slate-50 text-slate-600 border-slate-200" };
  };

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 w-full max-w-7xl mx-auto overflow-hidden">
      <div className="flex items-end justify-between mb-8 sm:mb-12">
        <div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            ¿Qué buscas hoy?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">
            Explora nuestros pasillos digitales
          </p>
        </div>
        
        <button
          onClick={() => handleCategoryClick("todos")}
          className="hidden md:flex items-center gap-2 text-red-600 font-bold hover:bg-red-50 px-5 py-2.5 rounded-full transition-all cursor-pointer"
        >
          Ver todo el catálogo <span>→</span>
        </button>
      </div>

      {/* 🔥 Scroll corregido (Sin distorsión) y Cargando... */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-8 gap-4 sm:gap-5 snap-x custom-scrollbar w-full">
          {categories.map((cat) => {
            const visuals = getCategoryVisuals(cat.name);

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className="min-w-[140px] sm:min-w-[160px] snap-start cursor-pointer group bg-white rounded-[2rem] p-5 text-center border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(220,38,38,0.08)] hover:border-red-100 transition-all duration-300 hover:-translate-y-1 active:scale-95 shrink-0"
              >
                <div className={`w-16 h-16 mx-auto ${visuals.bg} border rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
                  {visuals.icon}
                </div>
                
                <h3 className="mt-4 font-black text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight">
                  {cat.name}
                </h3>
                <p className="mt-1.5 text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">
                  {visuals.desc}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}