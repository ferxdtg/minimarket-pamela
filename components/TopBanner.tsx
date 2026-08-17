"use client";
import { useState, useEffect } from "react";

const promos = [
  "🔥 ¡Mega Oferta -15% OFF en abarrotes seleccionados!",
  "🚀 Delivery GRATIS por compras mayores a S/ 30.00",
  "✨ Pide por WhatsApp o Web y recibe en minutos"
];

export default function TopBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Oculta el texto actual
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % promos.length);
        setFade(true); // Muestra el nuevo texto
      }, 300); // Tiempo que dura desvanecido
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white text-[11px] sm:text-xs font-black text-center py-2 px-4 shadow-md z-[60] relative overflow-hidden">
      <div 
        className={`transition-opacity duration-300 ease-in-out tracking-wide ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {promos[currentIndex]}
      </div>
    </div>
  );
}