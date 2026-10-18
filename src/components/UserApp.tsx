import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { AppConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Instagram, Facebook, Radio, Headphones, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface RadioInfo {
  title: string;
  art: string;
  listeners: number;
  ulistener: number;
  bitrate: number;
  djusername: string;
  djprofile: string;
  history: string[];
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function UserApp() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const splashShown = useRef(false);
  const [countdown, setCountdown] = useState(0);
  const [radioInfo, setRadioInfo] = useState<RadioInfo | null>(null);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [isLoadingRadio, setIsLoadingRadio] = useState(true);
  const [errorRadio, setErrorRadio] = useState<string | null>(null);

  useEffect(() => {
    const fetchRadioInfo = async () => {
      try {
        setIsLoadingRadio(true);
        const response = await fetch('/api/radio-info');
        if (!response.ok) throw new Error('Radio server offline');
        const data = await response.json();
        setRadioInfo(data);
        setErrorRadio(null);
      } catch (error) {
        console.error('Error fetching radio info:', error);
        setErrorRadio('No hay datos de canciones; el reproductor puede seguir funcionando.');
      } finally {
        setIsLoadingRadio(false);
      }
    };

    fetchRadioInfo();
    const interval = setInterval(fetchRadioInfo, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (radioInfo?.title) {
      // Search for album art using iTunes API
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(radioInfo.title)}&media=music&entity=song&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            // Use higher resolution artwork
            setAlbumArt(data.results[0].artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg'));
          } else {
            setAlbumArt(null);
          }
        })
        .catch(err => console.error('Error searching album art:', err));
    }
  }, [radioInfo?.title]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'config', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AppConfig;
        setConfig(data);
        
        // Handle Splash Ad
        if (data.splashAd?.enabled && !splashShown.current) {
          splashShown.current = true;
          setShowSplash(true);
          setCountdown(data.splashAd.duration);
        }
      }
    }, (error) => {
      console.warn('Configuración de radio no disponible:', error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showSplash && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showSplash, countdown]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'JCM Radio',
        text: 'Escuchá JCM Radio en vivo!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard?.writeText(window.location.href).catch(console.warn);
      alert('Enlace copiado al portapapeles');
    }
  };

  const openWhatsApp = () => {
    if (!config?.socialLinks?.whatsapp) return;
    const url = `https://wa.me/${config.socialLinks.whatsapp.replace(/\\D/g, '')}`;
    window.open(url, '_blank');
  };


  return (
    <div className="min-h-screen bg-[#050816] flex flex-col items-center relative overflow-hidden font-sans text-white">
      {/* Immersive Atmospheric Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#1a1a1a_0%,#050505_70%)]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute -bottom-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-purple-900/20 blur-[120px]"
        />
      </div>

      <header className="relative z-10 flex w-full max-w-5xl items-center justify-between gap-3 p-5 sm:p-8"><div className="flex items-center gap-3 text-lg font-black tracking-widest"><Radio aria-hidden="true" className="text-indigo-300" /> JCM <span className="text-indigo-300">RADIO</span></div><button onClick={handleShare} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm hover:bg-white/10"><Share2 size={17} /> Compartir</button></header>
      {/* Splash Ad */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center p-6"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={config?.splashAd?.imageUrl || ''}
              alt="Splash Ad"
              className="max-w-full max-h-[60vh] object-contain rounded-3xl shadow-2xl shadow-blue-500/10"
              referrerPolicy="no-referrer"
            />
            <div className="mt-12 flex flex-col items-center gap-8">
              {countdown > 0 ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="text-4xl font-light font-mono text-white/80 tracking-widest">
                    {countdown}
                  </div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">
                    Conectando...
                  </p>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSplash(false)}
                  className="px-12 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-[0.2em] shadow-lg transition-all hover:bg-white/90"
                >
                  Entrar
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative z-10 w-full max-w-5xl px-6 pt-5 text-center"><span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-bold tracking-[.18em] text-red-200"><span className="h-2 w-2 animate-pulse rounded-full bg-red-400" /> EN VIVO 24/7</span><h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">La música nos <span className="text-indigo-300">conecta.</span></h1><p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">Tu radio online, estés donde estés. Escuchá JCM Radio desde el celular, tablet o computadora.</p><a href="#escuchar" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-indigo-500 px-6 font-bold text-white transition hover:bg-indigo-400"><Headphones size={20} /> Escuchar ahora</a></section>
      {/* Main Content */}
      <main id="escuchar" className="flex-1 w-full max-w-md md:max-w-lg lg:max-w-xl flex flex-col items-center justify-center p-4 py-10 sm:p-8 gap-8 md:gap-10 z-10 scroll-mt-6">
        
        {/* Technical Hardware Player Card */}
        <motion.div 
          whileHover={{ boxShadow: "0 0 40px -10px rgba(59, 130, 246, 0.3)" }}
          className="w-full bg-[#111628]/90 rounded-3xl p-5 sm:p-8 border border-indigo-300/20 shadow-2xl flex flex-col items-center gap-7 relative overflow-hidden transition-all duration-500"
        >
          {/* Dynamic Background Glow */}
          <div className="absolute inset-x-0 top-0 h-[200px] bg-blue-500/5 blur-[100px] -z-10" />
          
          {/* Subtle Glow Overlay */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          {/* Album Art with Hardware Housing */}
          <div className="relative group p-1 border border-[#2A2B2E] rounded-3xl bg-[#08090b]/50 shadow-inner">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-black/80 relative transition-transform duration-500"
            >
              <img
                src={albumArt || radioInfo?.art || "https://placehold.co/600x600/151b35/c4d2ff?text=JCM+RADIO"}
                alt={radioInfo?.title ? `Portada de ${radioInfo.title}` : "JCM Radio"}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
            </motion.div>

            {/* Live Indicator Widget */}
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#2a2b2e]/60">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#8E9299]">En Vivo</span>
            </div>
          </div>

          {/* Player Controls & Info */}
          <div className="flex flex-col items-center gap-4 w-full">
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans uppercase tracking-[0.05em] mb-1">
              JCM Radio
            </h2>
            <p className="text-sm font-medium text-[#6E7279] tracking-tighter truncate px-4 font-mono">
              {radioInfo?.title || "Transmisión en vivo"}
            </p>


          </div>

          {errorRadio && <p className="text-center text-xs text-amber-200/80">{errorRadio}</p>}
          {/* Technical Player Iframe Wrapper */}
          <div className="w-full min-w-0 border-t border-[#2A2B2E] pt-6">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="w-full rounded-xl overflow-hidden border border-[#2A2B2E] shadow-lg shadow-black/40"
            >
              <iframe 
                src="https://sp.aljania.com/cp/widgets/player/single/?p=8120" 
                className="block w-full h-[126px]"
                scrolling="no" 
                style={{ border: 'none' }}
                title="Reproductor JCM Radio"
                allow="autoplay"
              />
            </motion.div>
          </div>
          <p className="text-center text-xs text-white/50">Presioná Play para comenzar la transmisión.</p>
          <a href="https://sp.aljania.com/cp/widgets/player/single/?p=8120" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-indigo-300 underline underline-offset-4 hover:text-white">Abrir reproductor <ExternalLink size={15} /></a>
        </motion.div>

        </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-md md:max-w-lg lg:max-w-xl p-6 sm:p-8 flex flex-col items-center gap-7">
        <div className="flex justify-center gap-8 text-white/40">
          {config?.socialLinks?.instagram && <a href={config.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram"><Instagram size={24} /></a>}
          {config?.socialLinks?.facebook && <a href={config.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook"><Facebook size={24} /></a>}
          {config?.socialLinks?.tiktok && <a href={config.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="TikTok">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
          </a>}
        </div>
        
        <div className="text-[10px] font-medium text-white/20 uppercase tracking-[0.2em] flex flex-col items-center gap-2">
          <span>JCM RADIO — Escuchanos en todas partes</span>
          <a href="/admin" className="hover:text-white/40 transition-colors">Panel de Control</a>
        </div>
      </footer>
    </div>
  );
}
