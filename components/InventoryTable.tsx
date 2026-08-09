"use client";

export default function InventoryTable({ 
  initialProducts, 
  onStockChange 
}: { 
  initialProducts: any[]; 
  onStockChange: (id: string, newStock: number) => void; 
}) {

  const handleDelta = (id: string, currentStock: number, delta: number) => {
    const updatedStock = Math.max(0, (currentStock || 0) + delta);
    onStockChange(id, updatedStock);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black">Control de Almacén e Inventario</h2>
          <p className="text-xs text-zinc-400">Gestión en tiempo real de existencias y bloqueos automáticos.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-800/80 text-zinc-400 uppercase tracking-wider">
            <tr>
              <th className="p-3.5 rounded-l-xl">Producto</th>
              <th className="p-3.5">Precio</th>
              <th className="p-3.5">Stock Actual</th>
              <th className="p-3.5">Estado / Semáforo</th>
              <th className="p-3.5 rounded-r-xl text-center">Acciones Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {initialProducts.map(product => {
              const currentStock = product.stock ?? 0;
              const isOut = currentStock === 0;
              const isLow = currentStock > 0 && currentStock <= 5;

              return (
                <tr key={product.id} className="hover:bg-zinc-800/30 transition">
                  <td className="p-3.5 font-bold text-zinc-200">{product.name}</td>
                  <td className="p-3.5 text-red-400 font-bold">S/ {(product.price ?? 0).toFixed(2)}</td>
                  <td className="p-3.5 font-black text-sm">{currentStock} un.</td>
                  <td className="p-3.5">
                    {isOut ? (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        🔴 Agotado (Bloqueado)
                      </span>
                    ) : isLow ? (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        🟡 Stock Bajo
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        🟢 Saludable
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDelta(product.id, currentStock, -1)}
                      className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center transition cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleDelta(product.id, currentStock, 1)}
                      className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center transition cursor-pointer"
                    >
                      +
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}