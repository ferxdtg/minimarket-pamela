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
    <section className="relative w-full bg-[#F8F9FA] overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
      
      {/* 🔴 DESTELLOS SUAVES Y FRESCOS DE FONDO (Premium Glow) */}
      <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        
        {/* TEXTOS Y BOTONES (IZQUIERDA) */}
        <div className="text-center md:text-left space-y-6 md:pr-8">
          
          {/* 🔥 BADGE DINÁMICO E INTELIGENTE */}
          <div className="h-10 flex items-center justify-center md:justify-start">
            {!storeStatus.loading && (
              <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full font-bold text-xs shadow-sm border animate-in fade-in slide-in-from-bottom-4 duration-500 ${storeStatus.isOpen ? 'bg-white border-emerald-100 text-slate-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <span className="relative flex h-2.5 w-2.5">
                  {storeStatus.isOpen && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${storeStatus.isOpen ? 'bg-emerald-500' : 'bg-red-600'}`}></span>
                </span>
                <span className="uppercase tracking-widest">
                  {storeStatus.isOpen 
                    ? `Abierto • Lima ${storeStatus.timeStr}` 
                    : `Cerrado • Abre 06:00 a.m.`}
                </span>
              </div>
            )}
          </div>

          {/* TÍTULO PRINCIPAL */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Tu súper, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 drop-shadow-sm">
              sin salir de casa.
            </span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg max-w-lg mx-auto md:mx-0 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Abarrotes, lácteos, bebidas y limpieza. Pide rápido, paga seguro y recibe todo fresco en la puerta de tu hogar.
          </p>

          {/* 🚀 BOTONES ULTRA LIMPIOS */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            
            <button 
              onClick={() => handleAction("todos")}
              className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_8px_25px_rgba(220,38,38,0.3)] hover:shadow-[0_12px_30px_rgba(220,38,38,0.4)] hover:-translate-y-1 active:scale-95 cursor-pointer flex items-center justify-center gap-3 group"
            >
              Hacer mi pedido
              <span className="text-lg transition-transform group-hover:translate-x-1">🛵</span>
            </button>

            <button 
              onClick={() => handleAction("ofertas")}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300 border border-slate-200 shadow-sm hover:shadow-md active:scale-95 text-center cursor-pointer flex items-center justify-center gap-3"
            >
              Ver ofertas <span className="text-lg">🔥</span>
            </button>

          </div>

          {/* 🛡️ PRUEBA SOCIAL / CONFIANZA */}
          <div className="pt-6 flex items-center justify-center md:justify-start gap-6 text-slate-400 text-[11px] font-black uppercase tracking-widest animate-in fade-in duration-1000 delay-500">
            <span className="flex items-center gap-1.5"><span className="text-emerald-500 text-sm">✓</span> Pago Seguro</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-500 text-sm">✓</span> Frescura Total</span>
          </div>

        </div>

        {/* TARJETA FLOTANTE (DERECHA) - EFECTO CRISTAL */}
        <div className="hidden md:flex justify-end relative perspective-1000 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
          <div className="relative w-full max-w-sm bg-white/70 backdrop-blur-2xl border border-white p-8 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] transform rotate-2 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 cursor-pointer group"
               onClick={() => handleAction("ofertas")}>
            
            <div className="absolute -top-5 -right-5 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-[0_4px_15px_rgba(245,158,11,0.4)] transform rotate-12 group-hover:rotate-6 transition-transform">
              ¡Promo del día! 🔥
            </div>
            
            <div className="text-7xl mb-5 text-center group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 drop-shadow-sm">🛍️</div>
            <h3 className="text-2xl font-black text-slate-900 text-center mb-2 tracking-tight">Canasta Básica</h3>
            <p className="text-slate-500 text-center text-sm mb-6 font-medium leading-relaxed">Lleva todo lo que necesitas para la semana con descuentos exclusivos.</p>
            
            <button className="w-full py-4 bg-slate-50 group-hover:bg-red-50 text-slate-400 group-hover:text-red-600 font-black rounded-2xl transition-colors duration-300 border border-slate-100 shadow-inner active:scale-95 pointer-events-none uppercase tracking-wider text-xs">
              Explorar Canasta →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}