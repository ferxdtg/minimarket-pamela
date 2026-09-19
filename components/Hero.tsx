"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function Hero() {
  const [content, setContent] = useState({
    heroTitle: "Tu súper, sin salir de casa.",
    heroSubtitle: "Abarrotes, lácteos, bebidas y limpieza. Pide rápido, paga seguro y recibe todo fresco en la puerta de tu hogar.",
    promoCardTitle: "Canasta Básica",
    promoCardDesc: "Lleva todo lo que necesitas para la semana con descuentos exclusivos.",
    promoCardBadge: "¡Promo del día! 🔥",
    promoCardImage: ""
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "store"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setContent(prev => ({
          ...prev,
          heroTitle: data.heroTitle || prev.heroTitle,
          heroSubtitle: data.heroSubtitle || prev.heroSubtitle,
          promoCardTitle: data.promoCardTitle || prev.promoCardTitle,
          promoCardDesc: data.promoCardDesc || prev.promoCardDesc,
          promoCardBadge: data.promoCardBadge || prev.promoCardBadge,
          promoCardImage: data.promoCardImage || ""
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAction = (category: string) => {
    window.dispatchEvent(new CustomEvent("filter_category", { detail: category }));
    const section = document.getElementById("productos-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full bg-[#F8F9FA] overflow-hidden pt-5 pb-10 sm:pt-8 sm:pb-14 md:pt-16 md:pb-20">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-[1.15fr_0.85fr] lg:grid-cols-[1.25fr_0.75fr] gap-6 lg:gap-12 items-center">
        
        {/* COLUMNA IZQUIERDA: Textos y Botones */}
        <div className="text-center md:text-left space-y-4 sm:space-y-5 md:pr-4">
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] max-w-2xl mx-auto md:mx-0">
            {content.heroTitle}
          </h1>
          
          <p className="text-slate-500 text-sm sm:text-base lg:text-lg max-w-xl mx-auto md:mx-0 font-medium leading-relaxed">
            {content.heroSubtitle}
          </p>

          {/* Botones de acción principales */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start pt-1">
            <button 
              onClick={() => handleAction("todos")} 
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_8px_25px_rgba(220,38,38,0.3)] hover:shadow-[0_12px_30px_rgba(220,38,38,0.4)] hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5 group"
            >
              Hacer mi pedido <span className="text-base transition-transform group-hover:translate-x-1">🛵</span>
            </button>
            <button 
              onClick={() => handleAction("ofertas")} 
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-white hover:bg-slate-100 text-slate-700 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 border border-slate-200 shadow-xs active:scale-95 text-center cursor-pointer flex items-center justify-center gap-2.5"
            >
              Ver ofertas <span className="text-base opacity-90">🔥</span>
            </button>
          </div>

          {/* Badges de confianza */}
          <div className="pt-2 flex items-center justify-center md:justify-start gap-4 sm:gap-6 text-slate-400 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-1"><span className="text-emerald-500 text-xs">✓</span> Pago Seguro</span>
            <span className="flex items-center gap-1"><span className="text-emerald-500 text-xs">✓</span> Frescura Total</span>
            <span className="flex items-center gap-1"><span className="text-amber-500 text-xs">🪙</span> Ganas Pamela Coins</span>
          </div>

          {/* 📱 TARJETA PROMOCIONAL COMPACTA EN CELULAR (Diseño llamativo tipo Banner) */}
          <div className="md:hidden pt-3">
            <div 
              onClick={() => handleAction("ofertas")}
              className="relative bg-gradient-to-r from-amber-50 via-white to-red-50 border-2 border-red-200/80 p-4 rounded-3xl shadow-lg shadow-red-500/5 cursor-pointer text-left flex items-center gap-3 active:scale-98 transition-all overflow-hidden group"
            >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-red-600 to-orange-500 text-white text-[9px] font-black px-3 py-0.5 rounded-bl-xl shadow-xs uppercase tracking-wider">
                {content.promoCardBadge}
              </div>

              <div className="relative w-16 h-16 bg-white rounded-2xl p-2 shrink-0 border border-amber-200 flex items-center justify-center shadow-xs">
                {content.promoCardImage ? (
                  <Image src={content.promoCardImage} alt={content.promoCardTitle} fill className="object-contain p-1" />
                ) : (
                  <span className="text-3xl">🛍️</span>
                )}
              </div>

              <div className="min-w-0 flex-1 pr-1">
                <h4 className="text-sm font-black text-slate-900 tracking-tight leading-tight truncate group-hover:text-red-600 transition-colors">
                  {content.promoCardTitle}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                  {content.promoCardDesc}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-red-600 uppercase tracking-wide">
                  <span>Aprovechar ahora</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 💻 TARJETA PROMOCIONAL 3D EN ESCRITORIO */}
        <div className="hidden md:flex justify-end relative perspective-1000 w-full">
          <div 
            onClick={() => handleAction("ofertas")} 
            className="relative w-full max-w-[340px] lg:max-w-sm bg-white/85 backdrop-blur-2xl border border-white p-7 lg:p-8 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] transform rotate-2 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 cursor-pointer group ml-auto"
          >
            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-[0_4px_15px_rgba(245,158,11,0.4)] transform rotate-6 group-hover:rotate-3 transition-transform">
              {content.promoCardBadge}
            </div>
            
            <div className="mb-4 flex items-center justify-center h-28">
              {content.promoCardImage ? (
                <div className="relative w-28 h-28 group-hover:scale-110 transition-transform duration-500 drop-shadow-md">
                  <Image src={content.promoCardImage} alt={content.promoCardTitle} fill className="object-contain" />
                </div>
              ) : (
                <div className="text-7xl group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 drop-shadow-sm">🛍️</div>
              )}
            </div>

            <h3 className="text-2xl font-black text-slate-900 text-center mb-1.5 tracking-tight">{content.promoCardTitle}</h3>
            <p className="text-slate-500 text-center text-xs lg:text-sm mb-5 font-medium leading-relaxed">{content.promoCardDesc}</p>
            
            <button className="w-full py-3.5 bg-red-50 group-hover:bg-red-600 text-red-600 group-hover:text-white font-black rounded-2xl transition-colors duration-300 border border-red-100 shadow-xs active:scale-95 uppercase tracking-wider text-xs flex items-center justify-center gap-2">
              Explorar Canasta <span>→</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}