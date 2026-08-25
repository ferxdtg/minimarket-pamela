"use client";

import { useState, useEffect } from "react";

export default function Hero() {
  const [storeStatus, setStoreStatus] = useState({ isOpen: true, timeStr: "", loading: true });

  // 🕒 LÓGICA DE HORA EXACTA (LIMA, PERÚ)
  useEffect(() => {
    const updateTime = () => {
      const limaTimeStr = new Date().toLocaleString("en-US", { timeZone: "America/Lima" });
      const limaDate = new Date(limaTimeStr);
      
      const hours = limaDate.getHours();
      // Abierto desde las 06:00 hasta las 23:59
      const isOpen = hours >= 6 && hours < 24; 

      const formatter = new Intl.DateTimeFormat('es-PE', {
        hour: 'numeric', minute: '2-digit', hour12: true
      });
      
      setStoreStatus({ 
        isOpen, 
        timeStr: formatter.format(limaDate), 
        loading: false 
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Actualiza cada minuto
    return () => clearInterval(interval);
  }, []);

  const handleAction = (category: string) => {
    window.dispatchEvent(new CustomEvent("filter_category", { detail: category }));
    
    const section = document.getElementById("productos-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full bg-[#F8F9FA] overflow-hidden">
      
      {/* 🔴 DESTELLOS SUAVES Y FRESCOS DE FONDO */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-200/60 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-amber-200/50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 grid md:grid-cols-2 gap-10 items-center">
        
        {/* TEXTOS Y BOTONES (IZQUIERDA) */}
        <div className="text-center md:text-left space-y-6">
          
          {/* 🔥 BADGE DINÁMICO E INTELIGENTE */}
          {!storeStatus.loading && (
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-[0_2px_10px_rgba(0,0,0,0.04)] border ${storeStatus.isOpen ? 'bg-white border-emerald-100 text-slate-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <span className="relative flex h-2.5 w-2.5">
                {storeStatus.isOpen && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${storeStatus.isOpen ? 'bg-emerald-500' : 'bg-red-600'}`}></span>
              </span>
              <span>
                {storeStatus.isOpen 
                  ? `Abierto ahora • Lima ${storeStatus.timeStr}` 
                  : `Cerrado • Abre a las 06:00 a.m.`}
              </span>
            </div>
          )}

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.05]">
            Tu súper, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
              sin salir de casa.
            </span>
          </h1>
          
          <p className="text-slate-500 text-sm sm:text-lg max-w-lg mx-auto md:mx-0 font-medium leading-relaxed">
            Abarrotes, lácteos, bebidas y limpieza. Pide rápido, paga seguro y recibe todo fresco en la puerta de tu hogar.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start pt-4">
            <button 
              onClick={() => handleAction("todos")}
              className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all duration-300 shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_12px_25px_rgba(220,38,38,0.35)] hover:-translate-y-1 active:scale-95 cursor-pointer"
            >
              Hacer mi pedido 🛒
            </button>
            <button 
              onClick={() => handleAction("ofertas")}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl font-bold transition-all duration-300 border border-slate-200 shadow-sm hover:shadow-md active:scale-95 text-center cursor-pointer"
            >
              Ver ofertas 🔥
            </button>
          </div>
        </div>

        {/* TARJETA FLOTANTE (DERECHA) - EFECTO CRISTAL LIMPIO */}
        <div className="hidden md:flex justify-end relative perspective-1000">
          <div className="relative w-full max-w-sm bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] transform rotate-2 hover:rotate-0 transition-transform duration-500 cursor-pointer"
               onClick={() => handleAction("ofertas")}>
            
            <div className="absolute -top-6 -right-6 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg transform rotate-12">
              ¡Promo del día! 🔥
            </div>
            
            <div className="text-7xl mb-4 text-center group-hover:scale-110 transition-transform drop-shadow-sm">🛍️</div>
            <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Canasta Básica</h3>
            <p className="text-slate-500 text-center text-sm mb-6 font-medium">Lleva todo lo que necesitas para la semana con descuentos exclusivos.</p>
            
            <button className="w-full py-4 bg-slate-50 text-red-600 font-black rounded-2xl hover:bg-red-50 transition-colors border border-slate-100 shadow-sm active:scale-95 pointer-events-none">
              Explorar Canasta →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}