"use client";

export default function Testimonials() {
  const opiniones = [
    {
      id: 1,
      nombre: "María Sánchez",
      zona: "Vecina de la Urb. Principal",
      comentario: "¡Increíble servicio! Pedí abarrotes y productos de limpieza y llegaron en menos de 25 minutos. Todo fresco y muy ordenado.",
      estrellas: 5,
    },
    {
      id: 2,
      nombre: "Carlos Mendoza",
      zona: "Cliente Frecuente",
      comentario: "Me encanta la facilidad para buscar productos desde el celular. Minimarket Pamela se ha vuelto mi tienda de confianza para el día a día.",
      estrellas: 5,
    },
    {
      id: 3,
      nombre: "Lucía Fernández",
      zona: "Vecina local",
      comentario: "Los precios son justos y la atención por delivery es impecable. Da gusto apoyar a un negocio tan profesional.",
      estrellas: 5,
    },
  ];

  return (
    <section className="bg-zinc-900 text-white pt-4 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-red-500 font-extrabold text-xs uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            Comunidad y Confianza ⭐
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mt-3 tracking-tight">
            Lo que dicen nuestros vecinos
          </h2>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base">
            La satisfacción de nuestra comunidad es nuestra mejor carta de presentación.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {opiniones.map((item) => (
            <div 
              key={item.id}
              className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between hover:border-red-500/50 transition duration-300 shadow-xl h-full"
            >
              <div>
                <div className="flex text-yellow-400 text-sm mb-4">
                  {"★".repeat(item.estrellas)}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed italic">
                  "{item.comentario}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-700/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{item.nombre}</h4>
                  <p className="text-xs text-zinc-400">{item.zona}</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 font-bold flex items-center justify-center text-xs shrink-0">
                  ✓
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}