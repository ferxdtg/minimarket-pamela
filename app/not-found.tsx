import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <div className="text-center max-w-md space-y-6">
        <div className="w-24 h-24 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center justify-center mx-auto text-5xl">
          🛒
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-slate-900">404</h1>
          <h2 className="text-xl font-bold text-slate-700">Página no encontrada</h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Esta sección no existe o fue movida. Regresa a la tienda y sigue comprando.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl text-sm uppercase tracking-wide transition-all active:scale-95 shadow-lg shadow-red-600/30"
        >
          Volver a la Tienda 🛍️
        </Link>
      </div>
    </main>
  );
}
