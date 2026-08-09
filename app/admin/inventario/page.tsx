"use client";

import { useState, useEffect } from "react";
import InventoryTable from "@/components/InventoryTable";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminInventarioPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const list = querySnapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      setProducts(list);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdateStock = async (id: string, newStock: number) => {
    const stringId = String(id).trim();
    if (!stringId) return;

    // Actualización local inmediata
    setProducts(prev =>
      prev.map(p => ((p.id === stringId || p._id === stringId) ? { ...p, stock: newStock } : p))
    );

    try {
      const productRef = doc(db, "products", stringId);
      await updateDoc(productRef, { stock: newStock });
    } catch (error: any) {
      console.error("Error al actualizar stock:", error);
      alert(`No se pudo actualizar el stock: ${error.message}`);
      fetchProducts(); // Revertir si falla
    }
  };

  const handleUpdateProduct = async (id: string, updatedData: { name: string; price: number; stock: number; image: string }) => {
    const stringId = String(id).trim();
    if (!stringId) return;

    // Actualización local inmediata
    setProducts(prev =>
      prev.map(p => ((p.id === stringId || p._id === stringId) ? { ...p, ...updatedData } : p))
    );

    try {
      const productRef = doc(db, "products", stringId);
      await updateDoc(productRef, {
        name: updatedData.name,
        price: updatedData.price,
        stock: updatedData.stock,
        image: updatedData.image
      });
      console.log("Producto actualizado con éxito en Firebase");
    } catch (error: any) {
      console.error("Error al actualizar producto:", error);
      alert(`Error al guardar en Firebase: ${error.message}`);
      fetchProducts(); // Revertir si falla
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight">📦 Módulo de Almacén e Inventario</h1>
            <p className="text-xs text-zinc-400 mt-1">Control sincronizado en tiempo real con Firebase.</p>
          </div>
          <div>
            <a
              href="/admin/productos/nuevo"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
            >
              + Nuevo Producto
            </a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-500 font-bold animate-pulse">
            Sincronizando con Firebase...
          </div>
        ) : (
          <InventoryTable 
            initialProducts={products} 
            onStockChange={handleUpdateStock}
            onUpdateProduct={handleUpdateProduct}
          />
        )}

      </div>
    </div>
  );
}