"use client";

type CartNotificationProps = {
  message: string;
};

export default function CartNotification({ message }: CartNotificationProps) {
  if (!message) return null;

  return (
    <div className="fixed top-5 right-4 sm:right-6 z-[999999] pointer-events-none animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-md text-slate-900 border border-emerald-100 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.12)] px-4 py-3 flex items-center gap-3 max-w-sm">
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-base font-black shrink-0 shadow-inner">
          ✓
        </div>
        <div className="min-w-0 pr-2">
          <p className="text-xs font-black text-slate-900 tracking-tight leading-tight truncate">
            {message}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">
            Agregado al carrito 🛒
          </p>
        </div>
      </div>
    </div>
  );
}