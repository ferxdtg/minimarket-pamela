"use client";

import { useState } from "react";
import Image from "next/image";

export default function InventoryTable({ 
  initialProducts, 
  onStockChange,
  onUpdateProduct 
}: { 
  initialProducts: any[]; 
  onStockChange: (id: string, newStock: number) => void;
  onUpdateProduct: (id: string, updatedData: { name: string; price: number; stock: number; image: string }) => void;
}) {
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: 0, stock: 0, image: "" });

  const handleDelta = (product: any, delta: number) => {
    const id = product.id || product._id;
    const currentStock = Number(product.stock ?? 0);
    const updatedStock = Math.max(0, currentStock + delta);
    onStockChange(String(id), updatedStock);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),
      image: product.image || ""
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      const id = editingProduct.id || editingProduct._id;
      const finalImage = editForm.image || editingProduct.image || "";
      
      onUpdateProduct(String(id), {
        name: editForm.name,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        image: finalImage
      });
      setEditingProduct(null);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black">Control de Almacén e Inventario</h2>
          <p className="text-xs text-zinc-400">Gestión sincronizada en tiempo real.</p>
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
              <th className="p-3.5">Estado</th>
              <th className="p-3.5 rounded-r-xl text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {initialProducts.map(product => {
              const pId = product.id || product._id;
              const currentStock = Number(product.stock ?? 0);
              const isOut = currentStock === 0;
              const isLow = currentStock > 0 && currentStock <= 5;

              return (
                <tr key={pId} className="hover:bg-zinc-800/30 transition">
                  <td className="p-3.5">
                    <div className="relative w-12 h-12 bg-white rounded-xl overflow-hidden border border-zinc-700 flex items-center justify-center">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name || "Producto"}
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-400">Sin foto</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3.5 font-bold text-zinc-200">{product.name}</td>
                  <td className="p-3.5 text-red-400 font-bold">S/ {Number(product.price ?? 0).toFixed(2)}</td>
                  <td className="p-3.5 font-black text-sm">{currentStock} un.</td>
                  <td className="p-3.5">
                    {isOut ? (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        🔴 Agotado
                      </span>
                    ) : isLow ? (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        🟡 Bajo
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        🟢 OK
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelta(product, -1)}
                      className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold">{currentStock}</span>
                    <button
                      type="button"
                      onClick={() => handleDelta(product, 1)}
                      className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center transition cursor-pointer"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(product)}
                      className="ml-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-bold text-[11px] transition cursor-pointer border border-zinc-700"
                    >
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-base font-black">Editar Producto</h3>
              <button 
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-zinc-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Precio (S/)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Cantidad / Stock</label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Fotografía del Producto</label>
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <div className="relative w-12 h-12 bg-zinc-900 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                    {editForm.image ? (
                      <Image src={editForm.image} alt="Vista previa" fill className="object-contain p-1" />
                    ) : (
                      <span className="text-[9px] text-zinc-500 flex items-center justify-center h-full">N/A</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="w-full text-[11px] text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">Sube una foto o usa la cámara.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-zinc-300 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white transition cursor-pointer shadow-lg"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}