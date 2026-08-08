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
    <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        
        {/* TEXTO */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-5 py-2 rounded-full font-bold text-sm mb-6">
            🚚 Delivery rápido en tu zona
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            Tus productos favoritos <br/><strong>en minutos 🚀</strong>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-xl">
            Compra alimentos, bebidas y productos del hogar desde cualquier lugar. Nosotros llevamos tu compra hasta tu puerta.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {/* BOTÓN: Comprar ahora -> Lleva a ver todos los productos */}
            <button
              onClick={() => handleAction("todos")}
              className="bg-white text-red-600 px-8 py-4 rounded-full font-black text-lg shadow-xl hover:scale-105 transition cursor-pointer"
            >
              🛒 Comprar ahora
            </button>

            {/* BOTÓN: Ver ofertas -> Dirige a los productos en oferta */}
            <button
              onClick={() => handleAction("ofertas")}
              className="border-2 border-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-red-600 transition cursor-pointer"
            >
              🔥 Ver ofertas
            </button>
          </div>

          {/* ESTADISTICAS */}
          <div className="mt-12 grid grid-cols-3 gap-5">
            <div>
              <p className="text-3xl font-black">500+</p>
              <p className="text-sm text-white/80">Productos</p>
            </div>
            <div>
              <p className="text-3xl font-black">30 min</p>
              <p className="text-sm text-white/80">Delivery</p>
            </div>
            <div>
              <p className="text-3xl font-black">100%</p>
              <p className="text-sm text-white/80">Seguro</p>
            </div>
          </div>
        </div>

        {/* TARJETA DERECHA */}
        <div className="flex justify-center">
          <div className="relative bg-white/20 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/30 text-center">
            <div className="text-8xl md:text-9xl">🛒</div>
            <h2 className="text-3xl font-black mt-6">Pamela Market</h2>
            <p className="mt-3 text-white/90">Compra fácil desde tu celular</p>

            <div className="mt-8 bg-white rounded-2xl p-5 text-gray-800 shadow-xl">
              <p className="font-black">🔥 Oferta del día</p>
              <p className="mt-2 text-sm">Productos esenciales con precios especiales</p>
              
              {/* BOTÓN: Ver promociones -> Lleva directo a las ofertas */}
              <button
                onClick={() => handleAction("ofertas")}
                className="mt-4 bg-red-600 text-white px-5 py-2 rounded-full font-bold cursor-pointer hover:bg-red-700 transition"
              >
                Ver promociones
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}