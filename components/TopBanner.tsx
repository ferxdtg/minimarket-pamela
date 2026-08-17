"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function TopBanner() {
  const [promos, setPromos] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // 1. Escuchar a Firebase en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "promotions"), (snapshot) => {
      // Obtenemos todos los documentos y filtramos SOLO los activos
      const activePromos = snapshot.docs
        .map(doc => doc.data())
        .filter(promo => promo.active === true);
        
      setPromos(activePromos);
    });

    return () => unsubscribe();
  }, []);

  // 2. Lógica de rotación de anuncios
  useEffect(() => {
    if (promos.length <= 1) return; // Si hay 1 o 0 promos, no rota

    const interval = setInterval(() => {
      setFade(false); // Oculta
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % promos.length);
        setFade(true); // Muestra el siguiente
      }, 300);
    }, 4000); // Rota cada 4 segundos

    return () => clearInterval(interval);
  }, [promos.length]);

  // Si no hay campañas activas, el banner se oculta por completo
  if (promos.length === 0) return null;

  const currentPromo = promos[currentIndex] || promos[0];

  return (
    <div className="bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white text-[11px] sm:text-xs font-black text-center py-2 px-4 shadow-md z-[60] relative overflow-hidden">
      <div 
        className={`transition-opacity duration-300 ease-in-out tracking-wide flex items-center justify-center gap-2 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {currentPromo.discount && (
          <span className="bg-yellow-300 text-red-900 px-2 py-0.5 rounded-full uppercase text-[9px] tracking-bold">
            {currentPromo.discount}
          </span>
        )}
        <span>
          {currentPromo.title} {currentPromo.description && <span className="font-medium hidden sm:inline">- {currentPromo.description}</span>}
        </span>
      </div>
    </div>
  );
}