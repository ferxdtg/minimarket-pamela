"use client";

import { useState } from "react";
import Image from "next/image";

export default function InventoryTable({ 
  initialProducts, 
  onStockChange,
  onImageChange 
}: { 
  initialProducts: any[]; 
  onStockChange: (id: string, newStock: number) => void;
  onImageChange: (id: string, newImage: string) => void;
}) {
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState("");

  const handleDelta = (id: string, currentStock: number, delta: number) => {
    const updatedStock = Math.max(0, (currentStock || 0) + delta);
    onStockChange(id, updatedStock);
  };

  const handleSaveImage = (id: string) => {
    if (tempImage.trim()) {
      onImageChange(id, tempImage.trim());
    }
    setEditingImageId(null);
    setTempImage("");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black">Control de Almacén e Inventario</h2>
          <p className="text-xs text-zinc-400">Gestión sincronizada en tiempo real sin rebotes de stock.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-800/80 text-zinc-400 uppercase tracking-wider">
            <tr>
              <th className="p-3.5 rounded-l-xl">Imagen</th>
              <th className="p-3.5">Producto</th>
              <th className="p-3.5">Precio</th>
              <th className="p-3.5">Stock Actual</th>
              <th className="p-3.5">Estado / Semáforo</th>
              <th className="p-3.5 rounded-r-xl text-center">Acciones y Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {initialProducts.map(product => {
              const currentStock = product.stock ?? 0;
              const isOut = currentStock === 0;
              const isLow = currentStock > 0 && currentStock <= 5;
              const isEditing = editingImageId === product.id;

              return (
                <tr key={product.id} className="hover:bg-zinc-800/30 transition">
                  {/* IMAGEN Y EDICIÓN DE FOTO */}
                  <td className="p-3.5">
                    <div className="relative w-12 h-12 bg-white rounded-xl overflow-hidden border border-zinc-700 flex items-center justify-center group">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-400">Sin foto</span>
                      )}
                      <button
                        onClick={() => {
                          setEditingImageId(product.id);
                          setTempImage(product.image || "");
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition"
                        title="Cambiar foto"
                      >
                        📷 Editar
                      </button>
                    </div>

                    {/* MODAL / INPUT RÁPIDO PARA CAMBIAR FOTO */}
                    {isEditing && (
                      <div className="absolute z-20 mt-1 bg-zinc-950 border border-zinc-700 p-3 rounded-xl shadow-2xl w-64 space-y-2">
                        <p className="text-[10px] font-bold text-zinc-300">URL de la nueva foto:</p>
                        <input
                          type="text"
                          value={tempImage}
                          onChange={(e) => setTempImage(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-xs text-white"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingImageId(null)}
                            className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-bold"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveImage(product.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="p-3.5 font-bold text-zinc-200">{product.name}</td>
                  <td className="p-3.5 text-red-400 font-bold">S/ {(product.price ?? 0).toFixed(2)}</td>
                  <td className="p-3.5 font-black text-sm">{currentStock} un.</td>
                  <td className="p-3.5">
                    {isOut ? (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        🔴 Agotado
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
                      className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center transition cursor-pointer shadow"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleDelta(product.id, currentStock, 1)}
                      className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center transition cursor-pointer shadow"
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