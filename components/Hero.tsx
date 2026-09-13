"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function Hero() {
  const [storeStatus, setStoreStatus] = useState({ isOpen: true, timeStr: "", loading: true });

  const [content, setContent] = useState({
    openTime: "06:00",
    closeTime: "23:59",
    heroTitle: "Tu súper, sin salir de casa.",
    heroSubtitle: "Abarrotes, lácteos, bebidas y limpieza. Pide rápido, paga seguro y recibe todo fresco en la puerta de tu hogar.",
    promoCardTitle: "Canasta Básica",
    promoCardDesc: "Lleva todo lo que necesitas para la semana con descuentos exclusivos.",
    promoCardBadge: "¡Promo del día! 🔥",
    promoCardImage: ""
  });

  // 🕒 LÓGICA DE HORA EXACTA (LIMA, PERÚ) Y HORARIO DINÁMICO
  useEffect(() => {
    const updateTime = () => {
      const limaTimeStr = new Date().toLocaleString("en-US", { timeZone: "America/Lima" });
      const limaDate = new Date(limaTimeStr);
      
      const currentHour = limaDate.getHours();
      const currentMinute = limaDate.getMinutes();
      const currentTotalMinutes = currentHour * 60 + currentMinute;

      // Obtener hora de apertura y cierre desde Firebase
      const [openH, openM] = (content.openTime || "06:00").split(":").map(Number);
      const [closeH, closeM] = (content.closeTime || "23:59").split(":").map(Number);
      
      const openTotalMinutes = openH * 60 + openM;
      const closeTotalMinutes = closeH * 60 + closeM;

      let isOpen = false;
      if (openTotalMinutes < closeTotalMinutes) {
         // Horario normal (Ej: 06:00 a 22:00)
         isOpen = currentTotalMinutes >= openTotalMinutes && currentTotalMinutes <= closeTotalMinutes;
      } else {
         // Horario trasnoche (Ej: 18:00 a 02:00)
         isOpen = currentTotalMinutes >= openTotalMinutes || currentTotalMinutes <= closeTotalMinutes;
      }

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
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [content.openTime, content.closeTime]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "store"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setContent(prev => ({
          ...prev,
          openTime: data.openTime || prev.openTime,
          closeTime: data.closeTime || prev.closeTime,
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

  // Convertir formato militar (ej: "18:00") a formato 12 hrs (ej: "06:00 P.M.") para el texto de cerrado
  const formatOpenTimeText = (timeStr: string) => {
    if (!timeStr) return "06:00 A.M.";
    const [h, m] = timeStr.split(":");
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'P.M.' : 'A.M.';
    hour = hour % 12;
    hour = hour ? hour : 12; // La hora '0' debe ser '12'
    return `${hour.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  return (
    <section className="relative w-full bg-[#F8F9FA] overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-[1.1fr_0.9fr] lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 items-center">
        
        <div className="text-center md:text-left space-y-6 md:pr-4 lg:pr-8">
          
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
                    : `Cerrado • Abre ${formatOpenTimeText(content.openTime)}`}
                </span>
              </div>
            )}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[1.05] max-w-2xl mx-auto md:mx-0">
            {content.heroTitle}
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto md:mx-0 font-medium leading-relaxed">
            {content.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-4">
            <button onClick={() => handleAction("todos")} className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_8px_25px_rgba(220,38,38,0.3)] hover:shadow-[0_12px_30px_rgba(220,38,38,0.4)] hover:-translate-y-1 active:scale-95 cursor-pointer flex items-center justify-center gap-3 group">
              Hacer mi pedido <span className="text-lg transition-transform group-hover:translate-x-1">🛵</span>
            </button>
            <button onClick={() => handleAction("ofertas")} className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300 active:scale-95 text-center cursor-pointer flex items-center justify-center gap-3">
              Ver ofertas <span className="text-lg opacity-80">🔥</span>
            </button>
          </div>

          <div className="pt-6 flex items-center justify-center md:justify-start gap-6 text-slate-400 text-[11px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><span className="text-emerald-500 text-sm">✓</span> Pago Seguro</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-500 text-sm">✓</span> Frescura Total</span>
          </div>

        </div>

        <div className="hidden md:flex justify-end relative perspective-1000 w-full">
          <div onClick={() => handleAction("ofertas")} className="relative w-full max-w-[340px] lg:max-w-sm bg-white/70 backdrop-blur-2xl border border-white p-8 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] transform rotate-2 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 cursor-pointer group ml-auto">
            
            <div className="absolute -top-5 -right-5 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-[0_4px_15px_rgba(245,158,11,0.4)] transform rotate-12 group-hover:rotate-6 transition-transform">
              {content.promoCardBadge}
            </div>
            
            <div className="mb-5 flex items-center justify-center h-28">
              {content.promoCardImage ? (
                <div className="relative w-28 h-28 group-hover:scale-110 transition-transform duration-500 drop-shadow-md">
                  <Image src={content.promoCardImage} alt={content.promoCardTitle} fill className="object-contain" />
                </div>
              ) : (
                <div className="text-7xl group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 drop-shadow-sm">🛍️</div>
              )}
            </div>

            <h3 className="text-2xl font-black text-slate-900 text-center mb-2 tracking-tight">{content.promoCardTitle}</h3>
            <p className="text-slate-500 text-center text-sm mb-6 font-medium leading-relaxed">{content.promoCardDesc}</p>
            
            <button className="w-full py-4 bg-slate-50 group-hover:bg-red-50 text-slate-400 group-hover:text-red-600 font-black rounded-2xl transition-colors duration-300 border border-slate-100 shadow-inner active:scale-95 pointer-events-none uppercase tracking-wider text-xs">
              Explorar Canasta →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}