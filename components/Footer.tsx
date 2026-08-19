"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Logo o Marca */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Pamela Market
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Tu súper, sin salir de casa. Delivery express directo a tu puerta.
          </p>
        </div>

        {/* Enlaces de interés (Sin el botón admin visible) */}
        <div className="flex items-center gap-6 text-sm font-bold">
          <Link href="/seguimiento" className="text-slate-600 hover:text-red-600 transition-colors">
            Rastrear Pedido 🛵
          </Link>
          <a href="#productos-section" className="text-slate-600 hover:text-red-600 transition-colors">
            Catálogo
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-400 font-medium text-center md:text-right">
          © 2026 Pamela Market. Todos los derechos reservados.
        </div>

      </div>
    </footer>
  );
}