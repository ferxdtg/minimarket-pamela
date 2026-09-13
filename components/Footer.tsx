"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function Footer() {
  const [socials, setSocials] = useState({
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: ""
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "store"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSocials({
          facebookUrl: data.facebookUrl || "",
          instagramUrl: data.instagramUrl || "",
          tiktokUrl: data.tiktokUrl || ""
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Marca */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Pamela Market
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Tu súper, sin salir de casa. Delivery express directo a tu puerta.
          </p>
        </div>

        {/* Enlaces y Redes Sociales */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-6 text-sm font-bold">
            <Link href="/seguimiento" className="text-slate-600 hover:text-red-600 transition-colors">
              Rastrear Pedido 🛵
            </Link>
            <a href="#productos-section" className="text-slate-600 hover:text-red-600 transition-colors">
              Catálogo
            </a>
          </div>

          {/* Iconos de Redes Sociales (Aparecen si tienen URL en el admin) */}
          {(socials.facebookUrl || socials.instagramUrl || socials.tiktokUrl) && (
            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6">
              {socials.facebookUrl && (
                <a 
                  href={socials.facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-300 text-slate-600"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}

              {socials.instagramUrl && (
                <a 
                  href={socials.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-all duration-300 text-slate-600"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}

              {socials.tiktokUrl && (
                <a 
                  href={socials.tiktokUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-black hover:text-white flex items-center justify-center transition-all duration-300 text-slate-600"
                  title="TikTok"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.75 1.43-.06 2.67-.98 3.09-2.34.14-.42.21-.86.21-1.3V.02h-.01z"/>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-400 font-medium text-center md:text-right">
          © 2026 Pamela Market. Todos los derechos reservados.
        </div>

      </div>
    </footer>
  );
}