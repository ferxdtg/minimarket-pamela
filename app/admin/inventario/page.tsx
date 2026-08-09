"use client";

import { useState, useEffect } from "react";
import InventoryTable from "@/components/InventoryTable";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminInventarioPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para cargar los productos reales desde Firebase
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(list);
    } catch (error) {
      console.error("Error al cargar productos de Firebase:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Función para actualizar el stock directamente en Firebase al hacer clic en + o -
  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      // Actualización optimista local para respuesta instantánea
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, stock: newStock } : p))
      );

      // Actualización en la base de datos de Firebase
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, { stock: newStock });
    } catch (error) {
      console.error("Error al actualizar el stock en Firebase:", error);
      fetchProducts(); // Recargar si hay error para sincronizar
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Cabecera del módulo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight">📦 Módulo de Almacén e Inventario</h1>
            <p className="text-xs text-zinc-400 mt-1">Sincronizado en tiempo real con la base de datos de tu tienda.</p>
          </div>
          <div className="flex gap-2">
            <a
              href="/admin/productos/nuevo"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
            >
              + Nuevo Producto
            </a>
          </div>
        </div>

        {/* Contenido principal */}
        {loading ? (
          <div className="text-center py-20 text-zinc-500 font-bold animate-pulse">
            Cargando inventario desde Firebase...
          </div>
        ) : (
          <InventoryTable 
            initialProducts={products} 
            onStockChange={handleUpdateStock} 
          />
        )}

      </div>
    </div>
  );
}