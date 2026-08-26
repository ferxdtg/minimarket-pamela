import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Minimarket Pamela',
    short_name: 'Pamela',
    description: 'Tu súper, sin salir de casa. Abarrotes y delivery rápido.',
    start_url: '/',
    display: 'standalone', // Esto oculta la barra del navegador (estilo App real)
    background_color: '#F8F9FA',
    theme_color: '#DC2626', // El color rojo característico de tu marca
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}