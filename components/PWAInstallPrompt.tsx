"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    // 1. Ocultar si la web ya se ejecuta como App nativa instalada
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // 2. Respetar si el usuario descartó el aviso en los últimos 4 días
    const dismissedAt = localStorage.getItem("pwa_prompt_dismissed");
    if (dismissedAt) {
      const daysPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysPassed < 4) return;
    }

    // 3. Identificar entorno iOS / iPadOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }

    // 4. Capturar evento nativo en Android / Chrome / Edge
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    // Si es iOS o navegador sin disparador directo, abrir la guía adaptada
    if (isIOS || !deferredPrompt) {
      setShowHelpModal(true);
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch {
      setShowHelpModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowHelpModal(false);
    localStorage.setItem("pwa_prompt_dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* 📱 BANNER ADAPTABLE (Top en móviles / Bottom-Right en PC y Tablets) */}
      <aside
        role="alert"
        aria-label="Aviso de instalación"
        className="fixed top-18 sm:top-auto sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-84 z-50 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-bottom-4 duration-300"
      >
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex items-center justify-between gap-2.5">
          
          {/* Logo cuadrado con fallback */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-red-600 shrink-0 border border-slate-100 flex items-center justify-center text-white">
            <Image
              src="/productos/icon-192.png"
              alt="Logo Pamela Market"
              fill
              sizes="40px"
              className="object-cover"
            />
            <span className="font-black text-[10px]">PM</span>
          </div>

          {/* Información con truncado seguro en anchos reducidos */}
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs font-black text-slate-900 leading-tight truncate">
              Pamela Market
            </h4>
            <p className="text-[10px] text-slate-500 font-medium leading-tight truncate">
              Instala la app en tu inicio ⚡
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[11px] font-black px-3 py-1.5 rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap"
            >
              Instalar
            </button>

            <button
              onClick={handleDismiss}
              className="w-6 h-6 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs font-bold transition cursor-pointer"
              title="Cerrar aviso"
            >
              ✕
            </button>
          </div>

        </div>
      </aside>

      {/* 🧭 MODAL GUÍA UNIVERSAL (iOS / Navegadores sin auto-instalador) */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-3xl p-5 sm:p-6 text-slate-900 space-y-4 shadow-2xl border border-slate-100 text-center relative animate-in slide-in-from-bottom-6 duration-300">
            
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold cursor-pointer transition"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
              📱
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black tracking-tight text-slate-900">
                {isIOS ? "Instalar en iPhone / iPad" : "Instalación manual"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isIOS
                  ? "Sigue estos 2 pasos rápidos en Safari:"
                  : "Agrega la tienda a tu pantalla de inicio:"}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-left space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-slate-700 leading-snug">
                  {isIOS ? (
                    <>Toca el botón <strong>Compartir</strong> en la barra de Safari (el ícono <span className="font-mono text-sm font-bold">⎋</span>).</>
                  ) : (
                    <>Toca el menú del navegador (los <strong>tres puntos ⋮</strong> en la esquina).</>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-200/60 pt-2.5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-slate-700 leading-snug">
                  Selecciona <strong>"Agregar a inicio"</strong> o <strong>"Instalar aplicación"</strong> (ícono <span className="font-bold">➕</span>).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
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