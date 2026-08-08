'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario === 'admin' && password === '1234') {
      alert('¡Acceso concedido a Minimarket Pamela! 🛒');
      router.push('/admin/productos/nuevo');
    } else {
      alert('Usuario o contraseña incorrectos. Usa: admin / 1234');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-6">
          <span className="text-4xl">🔐</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Panel Administrador</h1>
          <p className="text-sm text-gray-500">Minimarket Pamela</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input
              type="text"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              placeholder="••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-bold shadow-md transition cursor-pointer"
          >
            Ingresar al Sistema
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-400">
          Usa usuario: <span className="font-semibold text-gray-600">admin</span> / contraseña: <span className="font-semibold text-gray-600">1234</span>
        </div>
      </div>
    </div>
  );
}