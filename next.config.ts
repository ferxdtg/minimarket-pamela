import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Headers de seguridad HTTP ───────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Evita que la página sea embebida en iframes de otros dominios (clickjacking)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Evita que el navegador "adivine" el tipo de contenido (MIME sniffing)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Controla la información de referencia enviada al navegar
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Deshabilita características del navegador que no usamos
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), payment=()",
          },
          // Fuerza HTTPS en navegadores modernos (1 año)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Content Security Policy básica para prevenir XSS
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // ─── Dominios de imágenes permitidos ────────────────────────────────────
  images: {
    remotePatterns: [
      {
        // Firebase Storage — imágenes de productos
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        // Google APIs (en caso de uso de Maps u otros)
        protocol: "https",
        hostname: "*.googleapis.com",
      },
      {
        // Googleusercontent (avatares, etc.)
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
