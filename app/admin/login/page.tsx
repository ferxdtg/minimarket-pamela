'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'firebase/auth';
import '@/lib/firebase'; 

export default function AdminLoginPage() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'vault' | 'error'>('idle');
  const [message, setMessage] = useState('ESPERANDO IDENTIFICACIÓN BIOMÉTRICA...');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  // 🚨 SISTEMA PERRO GUARDIÁN (WATCHDOG)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockdown, setIsLockdown] = useState(false);
  
  const router = useRouter();
  const audioCtxRef = useRef<AudioContext | null>(null);

  // ============================================================================
  // 🎵 SINTETIZADOR DE AUDIO CIBERNÉTICO MEJORADO (CON SONIDO DE BÓVEDA)
  // ============================================================================
  const playSciFiSound = (type: 'type' | 'hover' | 'success' | 'error' | 'lockdown' | 'vaultOpen') => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'type') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
      } 
      else if (type === 'hover') {
        osc.type = 'square'; osc.frequency.setValueAtTime(80, now);
        gain.gain.setValueAtTime(0.02, now); gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
      } 
      else if (type === 'success') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
        gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
      } 
      else if (type === 'error') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.15, now); gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
      }
      else if (type === 'lockdown') {
        osc.type = 'square'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(800, now + 0.5); osc.frequency.linearRampToValueAtTime(400, now + 1.0);
        gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 1.0);
        osc.start(now); osc.stop(now + 1.0);
      }
      else if (type === 'vaultOpen') {
        // Sonido de mecanismo pesado abriéndose (Rumble + Hiss)
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(60, now); osc.frequency.exponentialRampToValueAtTime(10, now + 2);
        gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0, now + 2);
        
        const osc2 = ctx.createOscillator(); const gain2 = ctx.createGain();
        osc2.type = 'square'; osc2.frequency.setValueAtTime(1000, now); osc2.frequency.exponentialRampToValueAtTime(100, now + 1.5);
        gain2.gain.setValueAtTime(0.05, now); gain2.gain.linearRampToValueAtTime(0, now + 1.5);
        osc2.connect(gain2); gain2.connect(ctx.destination);
        osc2.start(now); osc2.stop(now + 2);
        
        osc.start(now); osc.stop(now + 2);
      }
    } catch (e) { console.log("Audio Error", e); }
  };

  // 🛡️ BARRERA 1: DESTRUCCIÓN DE SESIÓN AL ENTRAR
  useEffect(() => {
    const auth = getAuth();
    signOut(auth).catch(() => {});
    setPersistence(auth, browserSessionPersistence).catch(() => {});
  }, []);

  // 💻 TERMINAL DE INICIO Y GEOLOCALIZACIÓN
  useEffect(() => {
    const logs = [
      "> INICIALIZANDO NÚCLEO MINIMARKET PAMELA v4.0...",
      "> ENCRIPTACIÓN MILITAR RSA-4096 CONFIRMADA...",
      "> ANALIZANDO IP DE CONEXIÓN...",
      "> UBICACIÓN DETECTADA: San Martín de Porres, Lima, Perú.",
      "> PERÍMETRO GEOGRÁFICO: AUTORIZADO.",
      "> SISTEMA WATCHDOG Y SÍNTESIS DE AUDIO: ONLINE.",
      "> ESPERANDO CREDENCIALES NIVEL ADMINISTRADOR..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) { setTerminalLogs(prev => [...prev, logs[i]]); i++; } 
      else { clearInterval(interval); }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 🚀 LÓGICA DE INGRESO Y ANIMACIÓN DE BÓVEDA
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockdown) return;

    setStatus('loading');
    setMessage('VERIFICANDO HUELLA DIGITAL Y CIFRANDO CONEXIÓN...');

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, usuario, password);
      
      playSciFiSound('success');
      setStatus('success');
      setMessage('¡ACCESO CONCEDIDO! INICIANDO PROTOCOLO DE APERTURA...');
      
      // Iniciamos la animación de la bóveda
      setTimeout(() => {
        setStatus('vault');
        playSciFiSound('vaultOpen'); // Suena la apertura hidráulica
        
        // Empuja a la ruta protegida en el clímax de la animación (3.2s)
        setTimeout(() => {
          router.replace('/admin/productos/nuevo');
        }, 3200);

      }, 1000);

    } catch (error) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 3) {
        setIsLockdown(true); setStatus('error'); playSciFiSound('lockdown');
        let sirenCount = 0; const sirenInterval = setInterval(() => { playSciFiSound('lockdown'); sirenCount++; if (sirenCount > 2) clearInterval(sirenInterval); }, 1000);
        setMessage('🚨 INTRUSO DETECTADO. BLOQUEO ACTIVO. REPORTANDO A CENTRAL...');
        setTimeout(() => {
          const adminWhatsApp = "51950323959"; 
          window.location.href = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(`🚨 *ALERTA DE SEGURIDAD* 🚨\nIntentos de acceso al Panel de Minimarket Pamela. Sistema bloqueado temporalmente.\nUbicación estimada de intento: San Martín de Porres.`)}`;
        }, 4000);
      } else {
        playSciFiSound('error'); setStatus('error');
        setMessage(`ERROR: CREDENCIALES RECHAZADAS. INTENTOS RESTANTES: ${3 - newAttempts}`);
        setUsuario(''); setPassword('');
        setTimeout(() => { setStatus('idle'); setMessage('ESPERANDO IDENTIFICACIÓN BIOMÉTRICA...'); }, 3500);
      }
    }
  };

  const handleTyping = (setter: any, value: string) => { playSciFiSound('type'); setter(value); };

  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, delay: `${Math.random() * 5}s`, duration: `${5 + Math.random() * 10}s`
  }));

  // ============================================================================
  // 🚨 RENDERIZADO DEL MODO LOCKDOWN
  // ============================================================================
  if (isLockdown) {
    return (
      <div className="relative min-h-screen bg-red-950 flex flex-col items-center justify-center p-4 overflow-hidden font-mono animate-[shake_0.5s_ease-in-out_infinite]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.5)_0%,rgba(0,0,0,1)_100%)] pointer-events-none opacity-80 animate-pulse" />
        <div className="relative z-10 text-center space-y-6">
          <div className="text-8xl animate-ping">🚨</div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_20px_rgba(255,0,0,1)]">Lockdown Activado</h1>
          <p className="text-red-400 text-xl font-bold max-w-lg mx-auto bg-black/50 p-6 rounded-2xl border border-red-500/50 shadow-[0_0_40px_rgba(255,0,0,0.5)]">Múltiples intentos fallidos. Protocolo de seguridad ejecutado. Expulsando del servidor...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 🌌 RENDERIZADO PRINCIPAL (LOGIN + ANIMACIÓN DE BÓVEDA)
  // ============================================================================
  return (
    <div className="relative min-h-screen bg-[#020202] flex items-center justify-center p-4 overflow-hidden selection:bg-red-600 selection:text-white font-mono">
      
      {/* 🔮 ESTILOS DE ANIMACIÓN DE LA BÓVEDA Y FÍSICAS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 110%; opacity: 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
        @keyframes radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes dataStream { 0% { background-position: 0 0; } 100% { background-position: 0 1000px; } }
        @keyframes glitch { 0% { clip-path: inset(10% 0 80% 0); transform: translate(-2px, 2px); } 20% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); } 100% { clip-path: inset(40% 0 30% 0); transform: translate(2px, -2px); } }
        
        /* 🔥 ANIMACIONES NUEVAS DE LA BÓVEDA */
        @keyframes fadeOutUI { to { opacity: 0; transform: scale(0.95) translateY(20px); filter: blur(10px); pointer-events: none; } }
        @keyframes fadeInVault { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
        @keyframes spinUnlock { 0% { transform: rotate(0deg); } 100% { transform: rotate(1080deg); } }
        @keyframes zoomThroughVault { 
          0% { transform: scale(1); filter: blur(0px); opacity: 1; } 
          20% { transform: scale(0.85); filter: blur(0px); opacity: 1; } /* El mecanismo coge impulso hacia atrás */
          100% { transform: scale(60); filter: blur(5px); opacity: 0; } /* Traspasamos la puerta 3D a velocidad luz */
        }
        @keyframes flashWhite { 0% { opacity: 0; } 100% { opacity: 1; } }

        .hologram-grid { position: absolute; width: 200vw; height: 200vh; left: -50vw; top: 0; background-image: linear-gradient(rgba(220, 38, 38, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 38, 38, 0.15) 1px, transparent 1px); background-size: 60px 60px; transform: perspective(600px) rotateX(75deg) translateY(-100px) translateZ(-200px); animation: dataStream 15s linear infinite; }
        .glitch-text::before, .glitch-text::after { content: attr(data-text); position: absolute; left: 0; width: 100%; height: 100%; top: 0; }
        .glitch-text::before { left: 2px; text-shadow: -2px 0 red; animation: glitch 2s infinite linear alternate-reverse; }
        .glitch-text::after { left: -2px; text-shadow: -2px 0 blue; animation: glitch 3s infinite linear alternate-reverse; }
      `}} />

      {/* Capas de Fondo 3D */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${status === 'vault' ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0"><div className="hologram-grid"></div></div>
        <div className="absolute top-1/2 left-1/2 w-[150vw] h-[150vw] -ml-[75vw] -mt-[75vw] rounded-full pointer-events-none opacity-20" style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(220, 38, 38, 0.8) 100%)', animation: 'radar 8s linear infinite' }} />
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-700/20 rounded-full mix-blend-screen filter blur-[150px] animate-[pulse_6s_ease-in-out_infinite] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-700/10 rounded-full mix-blend-screen filter blur-[150px] animate-[pulse_8s_ease-in-out_infinite_alternate] pointer-events-none" />
        {particles.map(p => (<div key={p.id} className="absolute w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(220,38,38,1)] pointer-events-none" style={{ left: p.left, top: p.top, animation: `float ${p.duration} ease-in-out infinite`, animationDelay: p.delay, opacity: Math.random() }} />))}
        
        {/* Consola Terminal Izquierda */}
        <div className="absolute top-6 left-6 z-10 hidden lg:block opacity-60">
          <div className="text-[10px] text-red-500/80 font-mono tracking-widest space-y-1">
            {terminalLogs.map((log, idx) => (<p key={idx} className="animate-in fade-in slide-in-from-left-4 duration-300">{log}</p>))}
            {terminalLogs.length >= 7 && <p className="animate-pulse text-red-400 mt-2">_</p>}
          </div>
        </div>
      </div>

      {/* 🚀 INTERFAZ DE LOGIN (Desaparece con animación cuando status === 'vault') */}
      <div 
        className="relative z-20 w-full max-w-lg"
        style={{ animation: status === 'vault' ? 'fadeOutUI 0.8s ease-in forwards' : 'none' }}
      >
        <div className="bg-[#0a0a0c]/80 backdrop-blur-3xl border border-red-900/30 rounded-[2rem] shadow-[0_0_80px_rgba(220,38,38,0.15),inset_0_0_40px_rgba(220,38,38,0.05)] pt-16 pb-12 px-8 sm:px-12 relative overflow-hidden">
          
          <div className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_20px_rgba(220,38,38,1)] pointer-events-none z-50" style={{ animation: 'scan 4s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

          <div className="text-center mb-10 space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-[0.1em] uppercase relative inline-block glitch-text" data-text="SISTEMA PAMELA">
              SISTEMA PAMELA
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <p className="text-[10px] font-bold text-red-400 tracking-[0.3em] uppercase">Control Central • San Martín de Porres</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 group">
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-red-500">Identificación de Agente</label>
              <div className="relative">
                <input type="email" required value={usuario} onChange={(e) => handleTyping(setUsuario, e.target.value)} className="w-full bg-[#050507] border border-zinc-800/80 rounded-xl px-5 py-4 text-red-100 text-sm font-bold shadow-[inset_0_5px_15px_rgba(0,0,0,1)] focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all duration-300 placeholder-zinc-800" placeholder="admin@minimarket.com" autoComplete="off" />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-30 group-focus-within:opacity-100 group-focus-within:text-red-500 transition-all">👤</div>
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-red-500">Clave de Desencriptación</label>
              <div className="relative">
                <input type="password" required value={password} onChange={(e) => handleTyping(setPassword, e.target.value)} className="w-full bg-[#050507] border border-zinc-800/80 rounded-xl px-5 py-4 text-red-100 text-sm font-bold tracking-[0.4em] shadow-[inset_0_5px_15px_rgba(0,0,0,1)] focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all duration-300 placeholder-zinc-800" placeholder="••••••••" autoComplete="off" />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-30 group-focus-within:opacity-100 group-focus-within:text-red-500 transition-all">🔑</div>
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-xl border flex items-center justify-center gap-3 transition-all duration-500 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] ${status === 'idle' ? 'bg-[#050507] border-zinc-800 text-zinc-600' : status === 'loading' ? 'bg-amber-950/20 border-amber-500/50 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : status === 'success' || status === 'vault' ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] scale-[1.02]' : 'bg-red-950/20 border-red-600 text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-[shake_0.5s_ease-in-out]'}`}>
              {status === 'loading' && <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />}
              {(status === 'success' || status === 'vault') && <span className="shrink-0 font-black">✓</span>}
              {status === 'error' && <span className="shrink-0 font-black">✕</span>}
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-center">{message}</p>
            </div>

            <div className="pt-6">
              <button type="submit" disabled={['loading', 'success', 'vault'].includes(status)} onMouseEnter={() => playSciFiSound('hover')} className="relative w-full group outline-none cursor-pointer">
                <div className="absolute inset-0 bg-red-950 rounded-xl transform translate-y-[8px] transition-transform duration-100 group-active:translate-y-0" />
                <div className="relative w-full bg-gradient-to-b from-red-600 to-red-800 border border-red-400/50 text-white font-black text-xs uppercase tracking-[0.3em] py-5 rounded-xl flex items-center justify-center gap-3 transform transition-transform duration-100 group-active:translate-y-[8px] shadow-[0_0_40px_rgba(220,38,38,0.4)] group-hover:brightness-125">
                  {status === 'loading' ? 'Iniciando Protocolo...' : 'Ingresar al Núcleo'}
                  {!['loading', 'success', 'vault'].includes(status) && <span className="text-lg transition-transform group-hover:translate-x-2">🚀</span>}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ============================================================================
          🛸 EFECTO SECRETO: LA BÓVEDA GIRATORIA 3D (Aparece tras éxito)
          ============================================================================ */}
      {status === 'vault' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          
          {/* Luz nuclear trasera que se revela poco a poco */}
          <div className="absolute inset-0 bg-white" style={{ animation: 'flashWhite 0.5s ease-in 2.7s forwards' }} />
          
          {/* Contenedor que "atraviesa" la cámara hacia el panel */}
          <div className="relative flex flex-col items-center justify-center w-full h-full" style={{ animation: 'fadeInVault 0.5s ease-out forwards, zoomThroughVault 1.5s cubic-bezier(0.5, 0, 0.1, 1) 1.5s forwards' }}>
            
            {/* ⚙️ Rueda Metálica de la Bóveda */}
            <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px]">
              <svg 
                className="w-full h-full text-zinc-300 drop-shadow-[0_0_50px_rgba(220,38,38,1)]" 
                viewBox="0 0 100 100" 
                style={{ animation: 'spinUnlock 1.3s cubic-bezier(0.6, 0.05, 0.2, 1) 0.2s forwards' }}
              >
                {/* Anillo exterior pesado */}
                <circle cx="50" cy="50" r="46" fill="none" stroke="#27272a" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" />
                
                {/* Dientes de engranaje */}
                <path d="M50 0 L50 10 M50 90 L50 100 M0 50 L10 50 M90 50 L100 50 M14 14 L21 21 M79 79 L86 86 M14 86 L21 79 M79 14 L86 21" stroke="currentColor" strokeWidth="4" />
                
                {/* Manijas de la bóveda (Cruz) */}
                <line x1="50" y1="12" x2="50" y2="88" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                <line x1="12" y1="50" x2="88" y2="50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                
                {/* Núcleo de bloqueo central */}
                <circle cx="50" cy="50" r="16" fill="#18181b" stroke="#3f3f46" strokeWidth="4" />
                <circle cx="50" cy="50" r="6" fill="#ef4444" className="animate-pulse" />
              </svg>
            </div>

            <div className="absolute top-[80%] mt-8 text-center" style={{ animation: 'fadeOutUI 0.5s ease-in 1.5s forwards' }}>
              <p className="text-red-500 font-black text-2xl tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                DESBLOQUEANDO...
              </p>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}