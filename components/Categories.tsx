"use client";

export default function Categories() {
  const categories = [
    { id: "ofertas", icon: "🔥", title: "Ofertas", description: "Súper promos", bg: "bg-red-50 text-red-600 border-red-100" },
    { id: "abarrotes", icon: "🍚", title: "Abarrotes", description: "Arroz, aceite...", bg: "bg-amber-50 text-amber-600 border-amber-100" },
    { id: "bebidas", icon: "🥤", title: "Bebidas", description: "Refrescos y más", bg: "bg-blue-50 text-blue-600 border-blue-100" },
    { id: "snacks", icon: "🍪", title: "Snacks", description: "Para el antojo", bg: "bg-orange-50 text-orange-600 border-orange-100" },
    { id: "limpieza", icon: "🧼", title: "Limpieza", description: "Hogar impecable", bg: "bg-teal-50 text-teal-600 border-teal-100" },
    { id: "bebes", icon: "🍼", title: "Bebés", description: "Pañales y leche", bg: "bg-pink-50 text-pink-600 border-pink-100" },
  ];

  const handleCategoryClick = (categoryId: string) => {
    window.dispatchEvent(new CustomEvent("filter_category", { detail: categoryId }));
    const section = document.getElementById("productos-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
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

      {/* 🔥 Scroll corregido: Eliminamos los márgenes negativos peligrosos */}
      <div className="flex overflow-x-auto pb-8 gap-4 sm:gap-5 snap-x custom-scrollbar w-full">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className="min-w-[140px] sm:min-w-[160px] snap-start cursor-pointer group bg-white rounded-[2rem] p-5 text-center border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(220,38,38,0.08)] hover:border-red-100 transition-all duration-300 hover:-translate-y-1 active:scale-95 shrink-0"
          >
            <div className={`w-16 h-16 mx-auto ${category.bg} border rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
              {category.icon}
            </div>
            
            <h3 className="mt-4 font-black text-slate-900 group-hover:text-red-600 transition-colors">
              {category.title}
            </h3>
            <p className="mt-1 text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">
              {category.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}