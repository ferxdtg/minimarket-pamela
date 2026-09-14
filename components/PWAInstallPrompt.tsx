"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. Evitar mostrar si ya está abierta como app independiente
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // 2. Comprobar si el usuario cerró el aviso recientemente (5 días)
    const dismissedAt = localStorage.getItem("pwa_prompt_dismissed");
    if (dismissedAt) {
      const daysPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysPassed < 5) return;
    }

    // 3. Detectar si es dispositivo iOS (iPhone / iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 2500);
      return () => clearTimeout(timer);
    }

    // 4. Evento nativo para Android y Google Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSModal(false);
    localStorage.setItem("pwa_prompt_dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* 📱 BANNER FLOTANTE INFERIOR */}
      <div className="fixed bottom-16 left-3 right-20 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-xs z-30 animate-in slide-in-from-bottom-5 fade-in duration-300">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center gap-2.5">
          
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-red-600 shrink-0 border border-slate-100 flex items-center justify-center text-white">
            <Image
              src="/productos/icon-192.png"
              alt="Pamela Market"
              fill
              className="object-cover"
            />
            <span className="font-black text-[10px]">PM</span>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-slate-900 truncate leading-tight">
              Pamela Market
            </h4>
            <p className="text-[10px] text-slate-500 font-medium leading-tight truncate">
              Instala la app en tu inicio ⚡
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer whitespace-nowrap"
            >
              Instalar
            </button>

            <button
              onClick={handleDismiss}
              className="w-5 h-5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-[11px] font-bold transition cursor-pointer"
              title="Cerrar aviso"
            >
              ✕
            </button>
          </div>

        </div>
      </div>

      {/* 🍏 MODAL EXPLICATIVO PARA IPHONE / SAFARI */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 text-slate-900 space-y-4 shadow-2xl border border-slate-100 text-center relative animate-in slide-in-from-bottom-6 duration-300">
            
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
              📲
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black tracking-tight text-slate-900">
                Instalar en iPhone / iPad
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Safari requiere que confirmes el acceso a tu pantalla de inicio siguiendo estos 2 toques:
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-left space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-slate-700 leading-snug">
                  Toca el botón <strong>Compartir</strong> en la barra inferior de Safari (el recuadro con la flecha hacia arriba <span className="font-mono text-sm">⎋</span>).
                </p>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-200/60 pt-2.5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-slate-700 leading-snug">
                  Desliza las opciones y selecciona <strong>"Agregar a inicio"</strong> (ícono <span className="font-bold">➕</span>).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
            >
              ¡Entendido, listo! 👍
            </button>

          </div>
        </div>
      )}
    </>
  );
}