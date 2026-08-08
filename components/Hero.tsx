"use client";

export default function Hero() {

  const handleAction = (category: string) => {
    // Envía el evento global para filtrar la categoría o mostrar todos los productos
    window.dispatchEvent(new CustomEvent("filter_category", { detail: category }));
    
    // Desplaza la vista suavemente hacia la sección de productos
    const section = document.getElementById("productos-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 text-white shadow-lg">
      
      {/* Patrón decorativo de fondo sutil */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* COLUMNA IZQUIERDA: TEXTO Y LLAMADO A LA ACCIÓN */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full font-bold text-sm mb-6 shadow-sm border border-white/25">
            🚚 Delivery rápido en tu zona
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
            Tus productos favoritos <br/><span className="text-yellow-100 drop-shadow-sm">en minutos 🚀</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/95 max-w-xl font-medium leading-relaxed">
            Compra alimentos frescos, abarrotes y artículos para el hogar en <strong className="text-white underline decoration-yellow-300">Minimarket Pamela</strong> con la confianza de siempre.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <button
              onClick={() => handleAction("Todos")}
              className="bg-white text-red-600 font-extrabold px-8 py-4 rounded-2xl shadow-xl hover:bg-yellow-50 transition transform hover:-translate-y-0.5 active:translate-y-0 text-base"
            >
              Ver Catálogo 🛒
            </button>

            {/* Enlace directo seguro al panel de administración que ya tienes configurado */}
            <a
              href="/admin/productos/nuevo"
              className="bg-red-700/80 hover:bg-red-800 text-white font-bold px-6 py-4 rounded-2xl backdrop-blur-md border border-white/20 transition text-base flex items-center gap-2"
            >
              Panel Admin ⚙️
            </a>
          </div>

          {/* ESTADÍSTICAS RÁPIDAS */}
          <div className="mt-12 pt-8 border-t border-white/20 grid grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-black tracking-tight">+500</p>
              <p className="text-xs md:text-sm text-white/90 font-medium">Productos</p>
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">30 min</p>
              <p className="text-xs md:text-sm text-white/90 font-medium">Delivery</p>
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">100%</p>
              <p className="text-xs md:text-sm text-white/90 font-medium">Seguro</p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: TARJETA INTERACTIVA FLOTANTE */}
        <div className="flex justify-center">
          <div className="relative bg-white/15 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-white/30 text-center w-full max-w-md transform transition hover:scale-[1.01]">
            
            {/* Etiqueta flotante superior */}
            <span className="absolute -top-3 right-6 bg-yellow-300 text-red-950 text-xs font-black px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider">
              ¡Abierto Hoy! ✨
            </span>

            <div className="text-7xl md:text-8xl mb-4 animate-bounce">🛒</div>
            <h2 className="text-3xl font-black tracking-tight">Pamela Market</h2>
            <p className="mt-2 text-white/95 text-sm font-medium">Compra fácil y rápido desde tu celular</p>

            <div className="mt-6 bg-white rounded-2xl p-5 text-gray-800 shadow-xl border border-white/50 text-left">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-red-600 text-sm">🔥 Oferta del día</span>
                <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">Ahorro</span>
              </div>
              <p className="mt-2 text-xs md:text-sm text-gray-600 font-medium">Productos esenciales de la canasta básica con precios especiales.</p>
              
              <button
                onClick={() => handleAction("ofertas")}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl transition text-sm shadow-sm flex items-center justify-center gap-2"
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