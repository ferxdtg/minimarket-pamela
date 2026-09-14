"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Evitar mostrar si ya está abierta como App nativa (standalone)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // 2. Comprobar si el usuario lo descartó recientemente (5 días)
    const dismissedAt = localStorage.getItem("pwa_prompt_dismissed");
    if (dismissedAt) {
      const daysPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysPassed < 5) return;
    }

    // 3. Detectar dispositivos iOS (Safari no soporta beforeinstallprompt nativo)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 3500);
      return () => clearTimeout(timer);
    }

    // 4. Capturar evento de instalación en Android / Chromium
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
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
    setShowIOSInstructions(false);
    localStorage.setItem("pwa_prompt_dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-16 left-3 right-20 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-xs z-30 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center gap-2.5">
        
        {/* Icono de la Tienda */}
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-red-600 shrink-0 border border-slate-100 flex items-center justify-center text-white">
          <Image
            src="/productos/icon-192.png"
            alt="Pamela Market"
            fill
            className="object-cover"
          />
          <span className="font-black text-[10px]">PM</span>
        </div>

        {/* Textos Informativos */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black text-slate-900 truncate leading-tight">
            Pamela Market
          </h4>
          <p className="text-[10px] text-slate-500 font-medium leading-tight truncate">
            {showIOSInstructions
              ? "Toca ⎋ y luego 'Añadir a inicio' ➕"
              : "Instala la app en tu inicio ⚡"}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 shrink-0">
          {!showIOSInstructions ? (
            <button
              onClick={handleInstallClick}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg transition shadow-sm cursor-pointer whitespace-nowrap"
            >
              Instalar
            </button>
          ) : (
            <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1.5 py-1 rounded">
              Paso 1: ⎋
            </span>
          )}

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
  );
}