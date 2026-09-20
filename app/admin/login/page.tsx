'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import '@/lib/firebase';

export const dynamic = 'force-dynamic';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setSessionCookie() {
  document.cookie = `admin_session=1; path=/; SameSite=Strict; Secure`;
}

function clearSessionCookie() {
  document.cookie = `admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;
}

// ─── Generador de sonido hiper-realista de Bóveda de Película ───────────────────
function createHeavyMetalClank(
  ctx: AudioContext,
  time: number,
  baseFreq: number,
  volume: number = 0.35,
  decay: number = 0.4
) {
  // 1. Golpe sordo grave (Impacto de masa metálica / deadbolt)
  const thudOsc = ctx.createOscillator();
  const thudGain = ctx.createGain();
  thudOsc.type = 'sine';
  thudOsc.frequency.setValueAtTime(baseFreq, time);
  thudOsc.frequency.exponentialRampToValueAtTime(25, time + decay * 0.7);
  thudGain.gain.setValueAtTime(volume * 1.2, time);
  thudGain.gain.exponentialRampToValueAtTime(0.001, time + decay * 0.7);
  thudOsc.connect(thudGain);
  thudGain.connect(ctx.destination);
  thudOsc.start(time);
  thudOsc.stop(time + decay);

  // 2. Resonancia metálica de acero grueso (Harmonic clang)
  const ringOsc1 = ctx.createOscillator();
  const ringGain1 = ctx.createGain();
  ringOsc1.type = 'triangle';
  ringOsc1.frequency.setValueAtTime(baseFreq * 2.8, time);
  ringOsc1.frequency.exponentialRampToValueAtTime(baseFreq * 2.4, time + decay);
  ringGain1.gain.setValueAtTime(volume * 0.4, time);
  ringGain1.gain.exponentialRampToValueAtTime(0.001, time + decay);
  ringOsc1.connect(ringGain1);
  ringGain1.connect(ctx.destination);
  ringOsc1.start(time);
  ringOsc1.stop(time + decay);

  // 3. Chasquido de trinquete de acero (Mechanical friction burst)
  const bufferSize = Math.floor(ctx.sampleRate * 0.06);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(baseFreq * 3.5, time);
  filter.Q.setValueAtTime(3, time);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.5, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(time);
  noise.stop(time + 0.07);
}

function playRealisticVaultAudio(ctx: AudioContext) {
  const now = ctx.currentTime;

  // ─── FASE 1: Serie de 3 pestillos mecánicos y engranajes pesados rotando ────
  // Clank 1 (Giro de manivela pesado)
  createHeavyMetalClank(ctx, now + 0.05, 110, 0.4, 0.35);

  // Clank 2 (Segundo pestillo de seguridad)
  createHeavyMetalClank(ctx, now + 0.55, 95, 0.5, 0.4);

  // Clank 3 (Tercer pestillo alineado)
  createHeavyMetalClank(ctx, now + 1.05, 80, 0.6, 0.45);

  // ─── FASE 2: EL GRAN DESBLOQUEO DEL PERNO MAESTRO (Heavy Steel Deadbolt) ───
  // Golpe sordo monumental a los 1.5s
  createHeavyMetalClank(ctx, now + 1.5, 55, 1.0, 0.8);
  createHeavyMetalClank(ctx, now + 1.52, 220, 0.5, 0.6);

  // Sub-graves que sacuden el piso (20Hz - 45Hz)
  const subBoom = ctx.createOscillator();
  const subBoomGain = ctx.createGain();
  subBoom.type = 'sine';
  subBoom.frequency.setValueAtTime(50, now + 1.5);
  subBoom.frequency.exponentialRampToValueAtTime(20, now + 3.2);
  subBoomGain.gain.setValueAtTime(0.8, now + 1.5);
  subBoomGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);
  subBoom.connect(subBoomGain);
  subBoomGain.connect(ctx.destination);
  subBoom.start(now + 1.5);
  subBoom.stop(now + 3.3);

  // ─── FASE 3: DESCOMPRESIÓN NEUMÁTICA (Sello de vacío hermético 'pssshhhh') ──
  const psshhDuration = 1.6;
  const psshhBufSize = Math.floor(ctx.sampleRate * psshhDuration);
  const psshhBuf = ctx.createBuffer(1, psshhBufSize, ctx.sampleRate);
  const psshhData = psshhBuf.getChannelData(0);
  for (let i = 0; i < psshhBufSize; i++) {
    psshhData[i] = Math.random() * 2 - 1;
  }
  const psshhSource = ctx.createBufferSource();
  psshhSource.buffer = psshhBuf;

  const psshhFilter = ctx.createBiquadFilter();
  psshhFilter.type = 'lowpass';
  psshhFilter.frequency.setValueAtTime(1400, now + 1.6);
  psshhFilter.frequency.exponentialRampToValueAtTime(250, now + 1.6 + psshhDuration);

  const psshhGain = ctx.createGain();
  psshhGain.gain.setValueAtTime(0.01, now + 1.6);
  psshhGain.gain.linearRampToValueAtTime(0.25, now + 1.8);
  psshhGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6 + psshhDuration);

  psshhSource.connect(psshhFilter);
  psshhFilter.connect(psshhGain);
  psshhGain.connect(ctx.destination);
  psshhSource.start(now + 1.6);
  psshhSource.stop(now + 1.6 + psshhDuration + 0.1);

  // ─── FASE 4: CRUJIDO METÁLICO PESADO DE LAS BISAGRAS (Heavy Iron Swing) ────
  const groanOsc = ctx.createOscillator();
  const groanGain = ctx.createGain();
  groanOsc.type = 'triangle';
  groanOsc.frequency.setValueAtTime(68, now + 2.1);
  groanOsc.frequency.linearRampToValueAtTime(54, now + 3.5);
  groanGain.gain.setValueAtTime(0.01, now + 2.1);
  groanGain.gain.linearRampToValueAtTime(0.18, now + 2.6);
  groanGain.gain.exponentialRampToValueAtTime(0.001, now + 3.7);

  groanOsc.connect(groanGain);
  groanGain.connect(ctx.destination);
  groanOsc.start(now + 2.1);
  groanOsc.stop(now + 3.8);
}

// ─── Componente Interno con SearchParams ─────────────────────────────────────
function AdminLoginContent() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'vault' | 'error'>('idle');
  const [message, setMessage] = useState('ESPERANDO IDENTIFICACIÓN...');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockdown, setIsLockdown] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/admin/productos/nuevo';
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Destruir sesión al entrar al login
  useEffect(() => {
    const auth = getAuth();
    signOut(auth).catch(() => {});
    clearSessionCookie();
    setPersistence(auth, browserSessionPersistence).catch(() => {});
  }, []);

  // Terminal animado
  useEffect(() => {
    const logs = [
      '> INICIALIZANDO NÚCLEO MINIMARKET PAMELA v5.0...',
      '> ENCRIPTACIÓN RSA-4096 CONFIRMADA...',
      '> ANALIZANDO CONEXIÓN...',
      '> UBICACIÓN: Comas, Lima, Perú.',
      '> PERÍMETRO GEOGRÁFICO: AUTORIZADO.',
      '> SISTEMA DE BÓVEDA BLINDADA: ONLINE.',
      '> ESPERANDO CREDENCIALES NIVEL ADMINISTRADOR...',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setTerminalLogs((prev) => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 380);
    return () => clearInterval(interval);
  }, []);

  // Sonidos sutiles y elegantes (sin ruidos molestos de 8-bits)
  const playSound = (type: 'type' | 'success' | 'error' | 'lockdown' | 'vaultOpen') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      if (type === 'type') {
        // Micro-click suave tipo teclado táctil mecánico de lujo (inaudiblemente agradable)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
      } else if (type === 'success') {
        // Doble tono metálico de confirmación suave
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'error') {
        // Tono bajo sordo de rechazo
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === 'lockdown') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.4);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'vaultOpen') {
        // 🔥 SONIDO CINEMATOGRÁFICO AUTÉNTICO DE BÓVEDA
        playRealisticVaultAudio(ctx);
      }
    } catch (e) {
      console.log('Audio Error', e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockdown) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    setStatus('loading');
    setMessage('VERIFICANDO CREDENCIALES Y CIFRANDO CONEXIÓN...');

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, usuario, password);

      setSessionCookie();
      playSound('success');
      setStatus('success');
      setMessage('¡CÓDIGO ACEPTADO! LIBERANDO MECANISMOS DE LA BÓVEDA...');

      setTimeout(() => {
        setStatus('vault');
        playSound('vaultOpen');
        setTimeout(() => {
          router.replace(redirectPath);
        }, 3600);
      }, 1000);
    } catch (error) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 3) {
        setIsLockdown(true);
        setStatus('error');
        playSound('lockdown');
        setMessage('🚨 INTRUSO DETECTADO. BLOQUEO ACTIVO.');
        setTimeout(() => {
          const adminWA = '51950323959';
          window.location.href = `https://wa.me/${adminWA}?text=${encodeURIComponent(
            '🚨 *ALERTA DE SEGURIDAD*\nIntentos de acceso al Panel de Minimarket Pamela. Sistema bloqueado temporalmente.'
          )}`;
        }, 4000);
      } else {
        playSound('error');
        setStatus('error');
        setMessage(`CREDENCIALES INCORRECTAS. Intentos restantes: ${3 - newAttempts}`);
        setPassword('');
        setTimeout(() => {
          setStatus('idle');
          setMessage('ESPERANDO IDENTIFICACIÓN...');
        }, 3000);
      }
    }
  };

  const handleTyping = (setter: (v: string) => void, value: string) => {
    playSound('type');
    setter(value);
  };

  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${6 + Math.random() * 8}s`,
  }));

  if (isLockdown) {
    return (
      <div className="relative min-h-screen bg-red-950 flex flex-col items-center justify-center p-4 overflow-hidden font-mono animate-[shake_0.5s_ease-in-out_infinite]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.5)_0%,rgba(0,0,0,1)_100%)] pointer-events-none opacity-80 animate-pulse" />
        <div className="relative z-10 text-center space-y-6">
          <div className="text-8xl animate-ping">🚨</div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_20px_rgba(255,0,0,1)]">
            Lockdown Activado
          </h1>
          <p className="text-red-400 text-xl font-bold max-w-lg mx-auto bg-black/50 p-6 rounded-2xl border border-red-500/50 shadow-[0_0_40px_rgba(255,0,0,0.5)]">
            Múltiples intentos fallidos. Protocolo de seguridad ejecutado. Expulsando del servidor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen bg-[#020202] flex items-center justify-center p-4 overflow-hidden selection:bg-red-600 selection:text-white font-mono ${
        status === 'vault' ? 'animate-[shake_0.3s_ease-in-out]' : ''
      }`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 110%; opacity: 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
        @keyframes radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes dataStream { 0% { background-position: 0 0; } 100% { background-position: 0 1000px; } }
        @keyframes glitch { 0% { clip-path: inset(10% 0 80% 0); transform: translate(-2px, 2px); } 20% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); } 100% { clip-path: inset(40% 0 30% 0); transform: translate(2px, -2px); } }
        @keyframes fadeOutUI { to { opacity: 0; transform: scale(0.9) translateY(40px); filter: blur(20px); pointer-events: none; } }
        @keyframes fadeInVault { from { opacity: 0; transform: scale(0.1) rotate(-45deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
        @keyframes heavySpinUnlock { 0% { transform: rotate(0deg); } 15% { transform: rotate(-15deg); } 80% { transform: rotate(1080deg); } 100% { transform: rotate(1080deg); } }
        @keyframes zoomThroughVault { 0% { transform: scale(1); filter: blur(0px); opacity: 1; } 10% { transform: scale(0.9); filter: blur(0px); opacity: 1; } 100% { transform: scale(150); filter: blur(10px); opacity: 0; } }
        @keyframes flashWhite { 0% { opacity: 0; } 100% { opacity: 1; } }
        .hologram-grid { position: absolute; width: 200vw; height: 200vh; left: -50vw; top: 0; background-image: linear-gradient(rgba(220, 38, 38, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 38, 38, 0.15) 1px, transparent 1px); background-size: 60px 60px; transform: perspective(600px) rotateX(75deg) translateY(-100px) translateZ(-200px); animation: dataStream 15s linear infinite; }
        .glitch-text::before, .glitch-text::after { content: attr(data-text); position: absolute; left: 0; width: 100%; height: 100%; top: 0; }
        .glitch-text::before { left: 2px; text-shadow: -2px 0 red; animation: glitch 2s infinite linear alternate-reverse; }
        .glitch-text::after { left: -2px; text-shadow: -2px 0 blue; animation: glitch 3s infinite linear alternate-reverse; }
      `,
        }}
      />

      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          status === 'vault' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="hologram-grid"></div>
        </div>
        <div
          className="absolute top-1/2 left-1/2 w-[150vw] h-[150vw] -ml-[75vw] -mt-[75vw] rounded-full pointer-events-none opacity-20"
          style={{
            background: 'conic-gradient(from 0deg, transparent 70%, rgba(220, 38, 38, 0.8) 100%)',
            animation: 'radar 8s linear infinite',
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-700/20 rounded-full mix-blend-screen filter blur-[150px] animate-[pulse_6s_ease-in-out_infinite] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-700/10 rounded-full mix-blend-screen filter blur-[150px] animate-[pulse_8s_ease-in-out_infinite_alternate] pointer-events-none" />
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(220,38,38,1)] pointer-events-none"
            style={{
              left: p.left,
              top: p.top,
              animation: `float ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
              opacity: Math.random(),
            }}
          />
        ))}
        <div className="absolute top-6 left-6 z-10 hidden lg:block opacity-60">
          <div className="text-[10px] text-red-500/80 font-mono tracking-widest space-y-1">
            {terminalLogs.map((log, idx) => (
              <p key={idx} className="animate-in fade-in slide-in-from-left-4 duration-300">
                {log}
              </p>
            ))}
            {terminalLogs.length >= 7 && <p className="animate-pulse text-red-400 mt-2">_</p>}
          </div>
        </div>
      </div>

      <div
        className="relative z-20 w-full max-w-lg"
        style={{ animation: status === 'vault' ? 'fadeOutUI 0.8s ease-in forwards' : 'none' }}
      >
        <div className="bg-[#0a0a0c]/80 backdrop-blur-3xl border border-red-900/30 rounded-[2rem] shadow-[0_0_80px_rgba(220,38,38,0.15),inset_0_0_40px_rgba(220,38,38,0.05)] pt-16 pb-12 px-8 sm:px-12 relative overflow-hidden">
          <div
            className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_20px_rgba(220,38,38,1)] pointer-events-none z-50"
            style={{ animation: 'scan 4s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

          <div className="text-center mb-10 space-y-2">
            <h1
              className="text-3xl sm:text-4xl font-black text-white tracking-[0.1em] uppercase relative inline-block glitch-text"
              data-text="SISTEMA PAMELA"
            >
              SISTEMA PAMELA
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <p className="text-[10px] font-bold text-red-400 tracking-[0.3em] uppercase">
                Control Central • Bóveda Blindada
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 group">
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-red-500">
                Correo de Administrador
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={usuario}
                  onChange={(e) => handleTyping(setUsuario, e.target.value)}
                  className="w-full bg-[#050507] border border-zinc-800/80 rounded-xl px-5 py-4 text-red-100 text-sm font-bold shadow-[inset_0_5px_15px_rgba(0,0,0,1)] focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all duration-300 placeholder-zinc-800"
                  placeholder="admin@minimarket.com"
                  autoComplete="email"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-30 group-focus-within:opacity-100 group-focus-within:text-red-500 transition-all">
                  👤
                </div>
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-red-500">
                Clave de Desencriptación
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => handleTyping(setPassword, e.target.value)}
                  className="w-full bg-[#050507] border border-zinc-800/80 rounded-xl px-5 py-4 pr-12 text-red-100 text-sm font-bold tracking-[0.4em] shadow-[inset_0_5px_15px_rgba(0,0,0,1)] focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all duration-300 placeholder-zinc-800"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-4 flex items-center text-zinc-600 hover:text-red-500 transition-colors cursor-pointer"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div
              className={`mt-6 p-4 rounded-xl border flex items-center justify-center gap-3 transition-all duration-500 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] ${
                status === 'idle'
                  ? 'bg-[#050507] border-zinc-800 text-zinc-600'
                  : status === 'loading'
                  ? 'bg-amber-950/20 border-amber-500/50 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                  : status === 'success' || status === 'vault'
                  ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] scale-[1.02]'
                  : 'bg-red-950/20 border-red-600 text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-[shake_0.5s_ease-in-out]'
              }`}
            >
              {status === 'loading' && (
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              {(status === 'success' || status === 'vault') && (
                <span className="shrink-0 font-black">✓</span>
              )}
              {status === 'error' && <span className="shrink-0 font-black">✕</span>}
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-center">
                {message}
              </p>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={['loading', 'success', 'vault'].includes(status)}
                className="relative w-full group outline-none cursor-pointer"
                aria-label="Abrir compuerta blindada"
              >
                <div className="absolute inset-0 bg-red-950 rounded-xl transform translate-y-[8px] transition-transform duration-100 group-active:translate-y-0" />
                <div className="relative w-full bg-gradient-to-b from-red-600 to-red-800 border border-red-400/50 text-white font-black text-xs uppercase tracking-[0.3em] py-5 rounded-xl flex items-center justify-center gap-3 transform transition-transform duration-100 group-active:translate-y-[8px] shadow-[0_0_40px_rgba(220,38,38,0.4)] group-hover:brightness-125">
                  {status === 'loading' ? 'Iniciando Protocolo...' : 'Abrir Bóveda Principal'}
                  {!['loading', 'success', 'vault'].includes(status) && (
                    <span className="text-lg transition-transform group-hover:translate-x-2">🔐</span>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      {status === 'vault' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div
            className="absolute inset-0 bg-white z-50 pointer-events-none opacity-0"
            style={{ animation: 'flashWhite 0.4s ease-in 2.8s forwards' }}
          />
          <div
            className="relative flex flex-col items-center justify-center w-full h-full opacity-0"
            style={{
              animation:
                'fadeInVault 0.5s ease-out forwards, zoomThroughVault 1.5s cubic-bezier(0.5, 0, 0.1, 1) 1.8s forwards',
            }}
          >
            <div className="relative w-[350px] h-[350px] md:w-[500px] md:h-[500px]">
              <svg
                className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
                viewBox="0 0 200 200"
              >
                <defs>
                  <radialGradient id="metalGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#d4d4d8" />
                    <stop offset="60%" stopColor="#52525b" />
                    <stop offset="100%" stopColor="#18181b" />
                  </radialGradient>
                  <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a1a1aa" />
                    <stop offset="50%" stopColor="#3f3f46" />
                    <stop offset="100%" stopColor="#09090b" />
                  </linearGradient>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.8" />
                  </filter>
                </defs>
                <circle cx="100" cy="100" r="95" fill="url(#metalGrad)" filter="url(#shadow)" />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="#09090b"
                  stroke="#3f3f46"
                  strokeWidth="3"
                  filter="url(#shadow)"
                />
                <g
                  style={{
                    transformOrigin: '100px 100px',
                    animation:
                      'heavySpinUnlock 1.8s cubic-bezier(0.6, -0.2, 0.2, 1.2) 0.1s forwards',
                  }}
                >
                  <circle cx="100" cy="100" r="78" fill="url(#metalGrad)" filter="url(#shadow)" />
                  <g stroke="url(#barGrad)" strokeWidth="14" strokeLinecap="round" filter="url(#shadow)">
                    <line x1="100" y1="18" x2="100" y2="182" />
                    <line x1="18" y1="100" x2="182" y2="100" />
                    <line x1="42" y1="42" x2="158" y2="158" />
                    <line x1="42" y1="158" x2="158" y2="42" />
                  </g>
                  <circle cx="100" cy="100" r="48" fill="none" stroke="#27272a" strokeWidth="10" filter="url(#shadow)" />
                  <circle cx="100" cy="100" r="38" fill="url(#metalGrad)" stroke="#18181b" strokeWidth="4" filter="url(#shadow)" />
                  <circle cx="100" cy="74" r="3" fill="#000" />
                  <circle cx="100" cy="126" r="3" fill="#000" />
                  <circle cx="74" cy="100" r="3" fill="#000" />
                  <circle cx="126" cy="100" r="3" fill="#000" />
                  <circle cx="100" cy="100" r="16" fill="#000" stroke="#ef4444" strokeWidth="3" />
                  <circle
                    cx="100"
                    cy="100"
                    r="6"
                    fill="#ef4444"
                    className="animate-pulse"
                    style={{ filter: 'drop-shadow(0 0 10px red)' }}
                  />
                </g>
              </svg>
            </div>
            <div
              className="absolute top-[85%] text-center opacity-0"
              style={{
                animation:
                  'fadeInVault 0.2s ease-out 0.2s forwards, fadeOutUI 0.3s ease-in 1.6s forwards',
              }}
            >
              <p className="text-red-500 font-black text-xl md:text-3xl tracking-[0.5em] animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,1)]">
                ABRIENDO BÓVEDA...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Export Principal con Suspense (Requerido por Next.js useSearchParams) ────
export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center font-mono">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-red-500 font-bold tracking-widest">INICIALIZANDO BÓVEDA...</p>
          </div>
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}