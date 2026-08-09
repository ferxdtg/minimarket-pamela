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
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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

  // Actualización de stock directa y segura (elimina el bug del rebote)
  const handleUpdateStock = async (id: string, newStock: number) => {
    // 1. Actualizamos de inmediato el estado local para fluidez visual absoluta
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, stock: newStock } : p))
    );

    try {
      // 2. Persistencia en Firebase en segundo plano
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, { stock: newStock });
    } catch (error) {
      console.error("Error al guardar stock en Firebase:", error);
      fetchProducts(); // Revertir si falla la red
    }
  };

  // Actualización de imagen directa en Firebase
  const handleUpdateImage = async (id: string, newImage: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, image: newImage } : p))
    );

    try {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, { image: newImage });
    } catch (error) {
      console.error("Error al guardar imagen en Firebase:", error);
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight">📦 Módulo de Almacén e Inventario</h1>
            <p className="text-xs text-zinc-400 mt-1">Control quirúrgico de stock y actualización de imágenes en vivo.</p>
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
            onImageChange={handleUpdateImage}
          />
        )}

      </div>
    </div>
  );
}