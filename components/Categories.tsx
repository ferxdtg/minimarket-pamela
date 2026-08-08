"use client";

export default function Categories() {

  const categories = [
    { id: "ofertas", icon: "🔥", title: "Ofertas", description: "Promociones y descuentos" },
    { id: "abarrotes", icon: "🍚", title: "Abarrotes", description: "Arroz, fideos y básicos" },
    { id: "bebidas", icon: "🥤", title: "Bebidas", description: "Gaseosas, jugos y agua" },
    { id: "snacks", icon: "🍪", title: "Snacks", description: "Galletas y dulces" },
    { id: "limpieza", icon: "🧼", title: "Limpieza", description: "Productos para tu hogar" },
    { id: "bebes", icon: "🍼", title: "Bebés", description: "Todo para los pequeños" },
  ];

  const handleCategoryClick = (categoryId: string) => {
    // Dispara el evento global con la categoría seleccionada
    window.dispatchEvent(new CustomEvent("filter_category", { detail: categoryId }));
    
    // Desplaza la vista suavemente hacia la sección de productos
    const section = document.getElementById("productos-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">
              Compra por categoría
            </h2>
            <p className="mt-3 text-gray-600">
              Encuentra lo que necesitas rápidamente
            </p>
          </div>
          
          <button
            onClick={() => handleCategoryClick("todos")}
            className="hidden md:block text-red-600 font-black cursor-pointer hover:underline"
          >
            Ver todas →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="group cursor-pointer bg-[#FFF8F0] rounded-3xl p-6 text-center hover:bg-red-600 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl"
            >
              <div className="text-5xl group-hover:scale-110 transition">
                {category.icon}
              </div>
              
              <h3 className="mt-4 font-black text-gray-900 group-hover:text-white">
                {category.title}
              </h3>
              
              <p className="mt-2 text-xs text-gray-600 group-hover:text-white/90">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}