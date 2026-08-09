"use client";

import InventoryTable from "@/components/InventoryTable";

// Datos de prueba iniciales (puedes conectarlos luego a tu base de datos de Firebase)
const MOCK_PRODUCTS = [
  { id: "1", name: "Leche Gloria Azul 400g", price: 4.50, stock: 12 },
  { id: "2", name: "Pañales Huggies Active Sec Etapa 3", price: 32.90, stock: 3 },
  { id: "3", name: "Arroz Costeño Extra Bolsa 5kg", price: 19.50, stock: 0 },
  { id: "4", name: "Aceite Primor Premium 1 Litro", price: 10.20, stock: 8 },
];

export default function AdminInventarioPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Cabecera del módulo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight">📦 Módulo de Almacén e Inventario</h1>
            <p className="text-xs text-zinc-400 mt-1">Supervisión en vivo de existencias y control de stock crítico.</p>
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

        {/* Tabla de Inventario Quirúrgico */}
        <InventoryTable initialProducts={MOCK_PRODUCTS} />

      </div>
    </div>
  );
}