'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'firebase/auth';
import '@/lib/firebase'; // 👈 Carga Firebase silenciosamente sin requerir exportar 'app'

export default function AdminLoginPage() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados para el panel de mensajes "WOW"
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('ESPERANDO IDENTIFICACIÓN BIOMÉTRICA...');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  const router = useRouter();

  // 🛡️ BARRERA 1: DESTRUCCIÓN DE SESIÓN Y PERSISTENCIA ESTRICTA
  useEffect(() => {
    const auth = getAuth();
    
    // Si llegaste a esta página (incluso dándole al botón "Atrás"), tu sesión muere al instante.
    signOut(auth).catch(() => {});
    
    // Si cierras la pestaña, la sesión muere (no dura para siempre).
    setPersistence(auth, browserSessionPersistence).catch(() => {});
  }, []);

  // 💻 EFECTO 2030: TERMINAL DE INICIO (Logs escribiéndose solos)
  useEffect(() => {
    const logs = [
      "> INICIALIZANDO TERMINAL MINIMARKET PAMELA v3.0...",
      "> ESTABLECIENDO CONEXIÓN CON FIREBASE CLUSTER...",
      "> ENCRIPTACIÓN RSA-4096 CONFIRMADA...",
      "> MOTOR DE BASE DE DATOS: ONLINE",
      "> ESPERANDO CREDENCIALES NIVEL ADMINISTRADOR..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setTerminalLogs(prev => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('ANALIZANDO HUELLA DIGITAL... CIFRANDO CONEXIÓN...');

    try {
      const auth = getAuth();
      // 🔥 Firebase valida contra la nube real
      await signInWithEmailAndPassword(auth, usuario, password);
      
      setStatus('success');
      setMessage('¡ACCESO CONCEDIDO! ABRIENDO BÓVEDA...');
      
      // 🛡️ BARRERA 2: ROUTER.REPLACE (Borra el historial de navegación para que no puedan volver atrás)
      setTimeout(() => {
        router.replace('/admin/productos/nuevo');
      }, 2000);

    } catch (error) {
      setStatus('error');
      setMessage('ERROR: CREDENCIALES RECHAZADAS. ACCESO DENEGADO.');
      setUsuario('');
      setPassword('');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('ESPERANDO IDENTIFICACIÓN BIOMÉTRICA...');
      }, 3500);
    }
  };

  // 🎇 EFECTO 2030: GENERADOR DE PARTÍCULAS DE DATOS
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${5 + Math.random() * 10}s`
  }));

  return (
    <div className="relative min-h-screen bg-[#020202] flex items-center justify-center p-4 overflow-hidden selection:bg-red-600 selection:text-white font-mono">
      
      {/* =========================================
          🔥 BLOQUE DE ESTILOS CSS MASIVOS (WOW)
          ========================================= */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes radar {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dataStream {
          0% { background-position: 0 0; }
          100% { background-position: 0 1000px; }
        }
        @keyframes glitch {
          0% { clip-path: inset(10% 0 80% 0); transform: translate(-2px, 2px); }
          20% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
          40% { clip-path: inset(30% 0 20% 0); transform: translate(-2px, -2px); }
          60% { clip-path: inset(60% 0 10% 0); transform: translate(2px, 2px); }
          80% { clip-path: inset(15% 0 60% 0); transform: translate(-2px, 2px); }
          100% { clip-path: inset(40% 0 30% 0); transform: translate(2px, -2px); }
        }
        .hologram-grid {
          position: absolute; width: 200vw; height: 200vh; left: -50vw; top: 0;
          background-image: linear-gradient(rgba(220, 38, 38, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 38, 38, 0.15) 1px, transparent 1px);
          background-size: 60px 60px;
          transform: perspective(600px) rotateX(75deg) translateY(-100px) translateZ(-200px);
          animation: dataStream 15s linear infinite;
        }
        .glitch-text::before, .glitch-text::after {
          content: attr(data-text); position: absolute; left: 0; width: 100%; height: 100%; top: 0;
        }
        .glitch-text::before { left: 2px; text-shadow: -2px 0 red; animation: glitch 2s infinite linear alternate-reverse; }
        .glitch-text::after { left: -2px; text-shadow: -2px 0 blue; animation: glitch 3s infinite linear alternate-reverse; }
      `}} />

      {/* =========================================
          🌌 CAPAS DE FONDO Y EFECTOS VISUALES 3D
          ========================================= */}
      
      {/* Malla 3D Holográfica en el piso */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="hologram-grid"></div>
      </div>

      {/* Radar Rotativo Gigante */}
      <div className="absolute top-1/2 left-1/2 w-[150vw] h-[150vw] -ml-[75vw] -mt-[75vw] rounded-full pointer-events-none opacity-20" style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(220, 38, 38, 0.8) 100%)', animation: 'radar 8s linear infinite' }} />

      {/* Orbes de luz de profundidad */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-700/20 rounded-full mix-blend-screen filter blur-[150px] animate-[pulse_6s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-700/10 rounded-full mix-blend-screen filter blur-[150px] animate-[pulse_8s_ease-in-out_infinite_alternate] pointer-events-none" />
      
      {/* Partículas de Datos Flotantes */}
      {particles.map(p => (
        <div key={p.id} className="absolute w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(220,38,38,1)] pointer-events-none" style={{ left: p.left, top: p.top, animation: `float ${p.duration} ease-in-out infinite`, animationDelay: p.delay, opacity: Math.random() }} />
      ))}

      {/* 💻 CONSOLA TERMINAL DE FONDO */}
      <div className="absolute top-6 left-6 z-10 hidden lg:block opacity-60">
        <div className="text-[10px] text-red-500/80 font-mono tracking-widest space-y-1">
          {terminalLogs.map((log, idx) => (
             <p key={idx} className="animate-in fade-in slide-in-from-left-4 duration-300">{log}</p>
          ))}
          {terminalLogs.length === 5 && <p className="animate-pulse text-red-400 mt-2">_</p>}
        </div>
      </div>

      {/* =========================================
          🚀 TARJETA CENTRAL DEL LOGIN (BÓVEDA)
          ========================================= */}
      <div className="relative z-20 w-full max-w-lg">
        
        <div className="bg-[#0a0a0c]/80 backdrop-blur-3xl border border-red-900/30 rounded-[2rem] shadow-[0_0_80px_rgba(220,38,38,0.15),inset_0_0_40px_rgba(220,38,38,0.05)] pt-16 pb-12 px-8 sm:px-12 relative overflow-hidden">
          
          {/* LÁSER DE ESCANEO DINÁMICO */}
          <div className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_20px_rgba(220,38,38,1)] pointer-events-none z-50" style={{ animation: 'scan 4s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />

          {/* Brillo superior interno tipo cristal */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

          {/* Encabezado Glitch */}
          <div className="text-center mb-10 space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-[0.1em] uppercase relative inline-block glitch-text" data-text="SISTEMA PAMELA">
              SISTEMA PAMELA
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <p className="text-[10px] font-bold text-red-400 tracking-[0.3em] uppercase">
                Red Administrativa Cifrada
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* INPUT 1: Efecto Bajo-Relieve (Cavidad 3D) */}
            <div className="space-y-2 group">
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-red-500">
                Identificación de Agente
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full bg-[#050507] border border-zinc-800/80 rounded-xl px-5 py-4 text-red-100 text-sm font-bold shadow-[inset_0_5px_15px_rgba(0,0,0,1)] focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all duration-300 placeholder-zinc-800"
                  placeholder="admin@minimarket.com"
                  autoComplete="off"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-30 group-focus-within:opacity-100 group-focus-within:text-red-500 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              </div>
            </div>

            {/* INPUT 2: Efecto Bajo-Relieve */}
            <div className="space-y-2 group">
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-red-500">
                Clave de Desencriptación
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050507] border border-zinc-800/80 rounded-xl px-5 py-4 text-red-100 text-sm font-bold tracking-[0.4em] shadow-[inset_0_5px_15px_rgba(0,0,0,1)] focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all duration-300 placeholder-zinc-800"
                  placeholder="••••••••"
                  autoComplete="off"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-30 group-focus-within:opacity-100 group-focus-within:text-red-500 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                </div>
              </div>
            </div>

            {/* PANTALLA HOLOGRÁFICA DE ESTADO DINÁMICA */}
            <div className={`mt-6 p-4 rounded-xl border flex items-center justify-center gap-3 transition-all duration-500 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] ${
              status === 'idle' ? 'bg-[#050507] border-zinc-800 text-zinc-600' :
              status === 'loading' ? 'bg-amber-950/20 border-amber-500/50 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' :
              status === 'success' ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] scale-[1.02]' :
              'bg-red-950/20 border-red-600 text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-[shake_0.5s_ease-in-out]'
            }`}>
              {status === 'loading' && <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />}
              {status === 'success' && <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              {status === 'error' && <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-center">
                {message}
              </p>
            </div>

            {/* BOTÓN 3D MECÁNICO - EFECTO DE HUNDIMIENTO FÍSICO */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="relative w-full group outline-none cursor-pointer"
              >
                {/* Capa de Base (Sombra Rígida) */}
                <div className="absolute inset-0 bg-red-950 rounded-xl transform translate-y-[8px] transition-transform duration-100 group-active:translate-y-0" />
                
                {/* Capa de Superficie (Cristal Rojizo) */}
                <div className="relative w-full bg-gradient-to-b from-red-600 to-red-800 border border-red-400/50 text-white font-black text-xs uppercase tracking-[0.3em] py-5 rounded-xl flex items-center justify-center gap-3 transform transition-transform duration-100 group-active:translate-y-[8px] shadow-[0_0_40px_rgba(220,38,38,0.4)] group-hover:brightness-125">
                  {status === 'loading' ? 'Iniciando Protocolo...' : 'Ingresar al Núcleo'}
                  {!['loading', 'success'].includes(status) && (
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                </div>
              </button>
            </div>

          </form>
        </div>

        {/* CÓDIGO DE BARRAS DECORATIVO INFERIOR */}
        <div className="mt-8 flex flex-col items-center justify-center opacity-30">
          <div className="text-4xl font-mono tracking-widest text-zinc-500 mix-blend-screen select-none">
            ||||| | ||| |||| | ||
          </div>
          <p className="text-[8px] font-black text-zinc-500 mt-2 tracking-[0.4em] uppercase">
            Autenticación Firebase Requerida
          </p>
        </div>

      </div>
    </div>
  );
}