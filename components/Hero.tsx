"use client";

export default function Hero() {
  const handleAction = (category: string) => {
    window.dispatchEvent(new CustomEvent("filter_category", { detail: category }));
    
    const section = document.getElementById("productos-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-red-600 via-orange-600 to-zinc-900 text-white shadow-xl pb-10">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 grid md:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="md:col-span-7 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm mb-4 border border-white/15 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
            <span>Delivery Express disponible en tu zona 🛵</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Todo para tu hogar <br/>
            <span className="text-yellow-200 drop-shadow-sm">al mejor precio y en minutos 🚀</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-white/95 max-w-xl font-normal leading-relaxed mx-auto md:mx-0">
            Bienvenido a <strong className="text-white underline decoration-yellow-300">Minimarket Pamela</strong>. Productos frescos, abarrotes y artículos esenciales directo a tu puerta con total seguridad.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 items-center justify-center md:justify-start">
            <button
              onClick={() => handleAction("Todos")}
              className="bg-white text-red-600 font-extrabold px-6 py-3 rounded-xl shadow-lg hover:bg-yellow-50 active:scale-95 transition text-sm sm:text-base cursor-pointer"
            >
              Ver Catálogo 🛒
            </button>
            {/* Botón Panel Admin eliminado de aquí como pediste */}
          </div>

          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-center md:text-left">
            <div>
              <p className="text-2xl font-black tracking-tight">+500</p>
              <p className="text-xs text-white/80 font-medium">Productos</p>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">30 min</p>
              <p className="text-xs text-white/80 font-medium">Entrega Rápida</p>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">100%</p>
              <p className="text-xs text-white/80 font-medium">Garantizado</p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="md:col-span-5 flex justify-center">
          <div className="relative bg-white/15 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/25 text-center w-full max-w-sm">
            <span className="absolute -top-3 right-5 bg-yellow-300 text-red-950 text-xs font-black px-3 py-1 rounded-full shadow uppercase tracking-wider">
              ¡Abierto Hoy! ✨
            </span>
            <div className="text-6xl mb-2">🛒</div>
            <h2 className="text-2xl font-black tracking-tight">Pamela Market</h2>
            <p className="mt-1 text-white/90 text-xs sm:text-sm font-medium">Tu tienda de confianza cerca de ti</p>

            <div className="mt-5 bg-white rounded-xl p-4 text-gray-800 shadow-md border border-white/40 text-left">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-600 text-xs">🔥 Ofertas Destacadas</span>
                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">Ahorro</span>
              </div>
              <p className="mt-1.5 text-xs text-gray-600 font-medium">Aprovecha los precios especiales de temporada en abarrotes.</p>
              <button
                onClick={() => handleAction("ofertas")}
                className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg transition text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Ver Promociones 🏷️
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}