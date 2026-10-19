import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/**
 * Señal de JCM Radio (Shoutcast v2 administrado con SonicPanel, MP3 320 kbps).
 * 1. URL SSL directa sin puerto (recomendada por SonicPanel para reproductores HTML5).
 * 2. Puerto SSL del servidor Shoutcast como respaldo.
 */
export const STREAM_URLS = ['https://sp.aljania.com/8120/stream', 'https://sp.aljania.com:8120/stream'];

/** Reproductor oficial de SonicPanel: alternativa si la señal no carga en el navegador. */
export const OFFICIAL_PLAYER_URL = 'https://sp.aljania.com/cp/widgets/player/single/?p=8120';

/**
 * Metadatos de la canción actual.
 * `/api/radio-info` existe en el servidor Express; en hosting estático (GitHub Pages) se intenta
 * la API pública de SonicPanel. Si ninguna responde, el reproductor sigue funcionando igual.
 */
const RADIO_INFO_URLS = ['/api/radio-info', 'https://sp.aljania.com/cp/get_info.php?p=8120'];
const RADIO_INFO_INTERVAL = 30_000;
const MAX_INFO_FAILURES = 2;

/** Cantidad de reconexiones automáticas antes de mostrar el error al oyente. */
const MAX_STREAM_FAILURES = STREAM_URLS.length * 2;
/** Si la señal no suena en este tiempo (conexión colgada o sin datos), se reconecta. */
const STALL_TIMEOUT = 12_000;
const VOLUME_STORAGE_KEY = 'jcm-radio-volume';

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'error';

export interface NowPlaying {
  title: string;
  art?: string;
  bitrate?: number;
}

interface RadioContextValue {
  status: PlayerStatus;
  /** El oyente pidió escuchar (está sonando o conectando). */
  isActive: boolean;
  volume: number;
  muted: boolean;
  /** iOS no permite cambiar el volumen desde la web: ahí solo se muestra silenciar. */
  canSetVolume: boolean;
  nowPlaying: NowPlaying | null;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export function safeUrl(value?: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch {
    return '';
  }
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\uFEFF/g, '').replace(/\s+/g, ' ').trim() : '';
}

function readStoredVolume(): number {
  try {
    const stored = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    if (stored !== null) {
      const value = Number(stored);
      if (Number.isFinite(value) && value >= 0 && value <= 1) return value;
    }
  } catch {
    /* almacenamiento no disponible (modo privado) */
  }
  return 0.8;
}

function useNowPlaying(): NowPlaying | null {
  const [info, setInfo] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let active = true;
    const failures = new Map<string, number>();

    const load = async () => {
      if (document.visibilityState === 'hidden') return;
      for (const url of RADIO_INFO_URLS) {
        if ((failures.get(url) ?? 0) >= MAX_INFO_FAILURES) continue;
        try {
          const response = await fetch(url, { cache: 'no-store' });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = (await response.json()) as Record<string, unknown>;
          const title = cleanText(data.title);
          if (!title) throw new Error('Respuesta sin título');
          failures.set(url, 0);
          const bitrate = Number(data.bitrate);
          if (active) {
            setInfo({ title, art: safeUrl(data.art) || undefined, bitrate: Number.isFinite(bitrate) && bitrate > 0 ? bitrate : undefined });
          }
          return;
        } catch {
          failures.set(url, (failures.get(url) ?? 0) + 1);
        }
      }
    };

    void load();
    const timer = window.setInterval(load, RADIO_INFO_INTERVAL);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return info;
}

export function RadioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const wantsPlayback = useRef(false);
  const sourceIndex = useRef(0);
  const failures = useRef(0);
  const attempt = useRef(0);
  const handledAttempt = useRef(-1);
  const retryTimer = useRef<number | undefined>(undefined);
  const stallTimer = useRef<number | undefined>(undefined);
  const handleFailureRef = useRef<() => void>(() => undefined);

  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [volume, setVolumeState] = useState(readStoredVolume);
  const [muted, setMuted] = useState(false);
  const [canSetVolume, setCanSetVolume] = useState(true);
  const nowPlaying = useNowPlaying();

  /** Corta la descarga del stream (al reanudar se vuelve a conectar al vivo). */
  const release = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    if (audio.hasAttribute('src')) {
      audio.removeAttribute('src');
      audio.load();
    }
  }, []);

  const clearStallWatchdog = useCallback(() => window.clearTimeout(stallTimer.current), []);

  const startStallWatchdog = useCallback(() => {
    window.clearTimeout(stallTimer.current);
    stallTimer.current = window.setTimeout(() => handleFailureRef.current(), STALL_TIMEOUT);
  }, []);

  const connect = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !wantsPlayback.current) return;
    window.clearTimeout(retryTimer.current);
    attempt.current += 1;
    setStatus('loading');
    startStallWatchdog();
    audio.src = STREAM_URLS[sourceIndex.current];
    audio.play().catch((error: unknown) => {
      if (!wantsPlayback.current) return;
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        // El navegador bloqueó la reproducción: el oyente debe volver a tocar Play.
        wantsPlayback.current = false;
        clearStallWatchdog();
        release();
        setStatus('idle');
      }
      // Los errores de red/formato llegan por el evento "error" del elemento <audio>.
    });
  }, [clearStallWatchdog, release, startStallWatchdog]);

  const handleFailure = useCallback(() => {
    if (!wantsPlayback.current || handledAttempt.current === attempt.current) return;
    handledAttempt.current = attempt.current;
    clearStallWatchdog();
    failures.current += 1;
    if (failures.current >= MAX_STREAM_FAILURES) {
      wantsPlayback.current = false;
      release();
      setStatus('error');
      return;
    }
    sourceIndex.current = (sourceIndex.current + 1) % STREAM_URLS.length;
    setStatus('loading');
    window.clearTimeout(retryTimer.current);
    retryTimer.current = window.setTimeout(connect, 1200);
  }, [clearStallWatchdog, connect, release]);

  useEffect(() => {
    handleFailureRef.current = handleFailure;
  }, [handleFailure]);

  const play = useCallback(() => {
    wantsPlayback.current = true;
    failures.current = 0;
    connect();
  }, [connect]);

  const pause = useCallback(() => {
    wantsPlayback.current = false;
    window.clearTimeout(retryTimer.current);
    clearStallWatchdog();
    release();
    setStatus('idle');
  }, [clearStallWatchdog, release]);

  const toggle = useCallback(() => {
    if (wantsPlayback.current) pause();
    else play();
  }, [pause, play]);

  const setVolume = useCallback((value: number) => {
    const next = Math.min(1, Math.max(0, value));
    setVolumeState(next);
    if (next > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => setMuted((current) => !current), []);

  // Eventos del elemento <audio>.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlaying = () => {
      if (!wantsPlayback.current) return;
      clearStallWatchdog();
      failures.current = 0;
      setStatus('playing');
    };
    const onWaiting = () => {
      if (!wantsPlayback.current) return;
      setStatus('loading');
      startStallWatchdog();
    };
    const onError = () => {
      if (audio.hasAttribute('src')) handleFailure();
    };
    const onEnded = () => handleFailure();
    const onPause = () => {
      // Pausa externa (controles del sistema, llamada entrante, auriculares desconectados).
      if (!wantsPlayback.current || audio.ended || audio.error) return;
      wantsPlayback.current = false;
      window.clearTimeout(retryTimer.current);
      clearStallWatchdog();
      release();
      setStatus('idle');
    };
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('pause', onPause);
    };
  }, [clearStallWatchdog, handleFailure, release, startStallWatchdog]);

  useEffect(
    () => () => {
      window.clearTimeout(retryTimer.current);
      window.clearTimeout(stallTimer.current);
    },
    [],
  );

  // Detecta si el navegador permite controlar el volumen (iOS lo ignora).
  useEffect(() => {
    const probe = document.createElement('audio');
    probe.volume = 0.5;
    setCanSetVolume(Math.abs(probe.volume - 0.5) < 0.01);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
    } catch {
      /* sin almacenamiento */
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  // Controles de la pantalla de bloqueo / notificaciones (Media Session API).
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => play()],
      ['pause', () => pause()],
      ['stop', () => pause()],
    ];
    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        /* acción no soportada */
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          session.setActionHandler(action, null);
        } catch {
          /* acción no soportada */
        }
      }
    };
  }, [pause, play]);

  useEffect(() => {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: nowPlaying?.title || 'JCM Radio en vivo',
      artist: 'JCM Radio',
      album: 'La radio que te acompaña',
      artwork: nowPlaying?.art ? [{ src: nowPlaying.art }] : [],
    });
  }, [nowPlaying?.art, nowPlaying?.title]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = status === 'playing' || status === 'loading' ? 'playing' : 'paused';
  }, [status]);

  const value = useMemo<RadioContextValue>(
    () => ({
      status,
      isActive: status === 'playing' || status === 'loading',
      volume,
      muted,
      canSetVolume,
      nowPlaying,
      play,
      pause,
      toggle,
      setVolume,
      toggleMute,
    }),
    [canSetVolume, muted, nowPlaying, pause, play, setVolume, status, toggle, toggleMute, volume],
  );

  return (
    <RadioContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="none" hidden />
    </RadioContext.Provider>
  );
}

export function useRadio(): RadioContextValue {
  const context = useContext(RadioContext);
  if (!context) throw new Error('useRadio debe usarse dentro de <RadioProvider>');
  return context;
}
