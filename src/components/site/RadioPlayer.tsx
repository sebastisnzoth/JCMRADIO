import { useEffect, useState, type CSSProperties } from 'react';
import { ExternalLink, LoaderCircle, Pause, Play, Radio } from 'lucide-react';
import { SpeakerIcon } from './icons';
import { BrandTile } from './Logo';
import { OFFICIAL_PLAYER_URL, useRadio } from './radio';

/** Botón rojo "Escuchar ahora": inicia o pausa la radio desde cualquier parte del sitio. */
export function ListenButton({ variant, onClick }: { variant: 'header' | 'hero' | 'menu'; onClick?: () => void }) {
  const { status, toggle } = useRadio();
  const loading = status === 'loading';
  const playing = status === 'playing';
  const label = loading ? 'Conectando…' : playing ? 'Pausar radio' : 'Escuchar ahora';
  const Icon = loading ? LoaderCircle : playing ? Pause : variant === 'hero' ? Play : Radio;
  const filled = !loading && (playing || variant === 'hero');

  return (
    <button
      type="button"
      className={`jcm-btn jcm-btn--red jcm-btn--${variant}`}
      onClick={() => {
        toggle();
        onClick?.();
      }}
    >
      <Icon className={loading ? 'jcm-spin' : undefined} fill={filled ? 'currentColor' : 'none'} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export function RadioPlayer() {
  const radio = useRadio();
  const [coverFailed, setCoverFailed] = useState(false);
  const cover = radio.nowPlaying?.art;
  const track = radio.nowPlaying?.title;

  useEffect(() => setCoverFailed(false), [cover]);

  const loading = radio.status === 'loading';
  const playing = radio.status === 'playing';
  const effectiveVolume = radio.muted ? 0 : radio.volume;
  const volumeLevel = effectiveVolume === 0 ? 0 : effectiveVolume < 0.5 ? 1 : 2;

  const statusText =
    radio.status === 'loading'
      ? 'Conectando con la señal…'
      : radio.status === 'error'
        ? 'Señal no disponible por el momento'
        : 'La radio que te acompaña';

  return (
    <section className="jcm-player" aria-label="Reproductor de JCM Radio">
      <div className="jcm-player__top">
        <div className="jcm-player__cover">
          {cover && !coverFailed ? <img src={cover} alt="" onError={() => setCoverFailed(true)} /> : <BrandTile />}
        </div>
        <div className="jcm-player__meta">
          <strong className="jcm-player__name">JCM RADIO</strong>
          <span className="jcm-player__track" title={track || undefined}>
            {track || 'Transmitiendo en vivo'}
          </span>
          <span className="jcm-player__status" aria-live="polite">
            {statusText}
          </span>
        </div>
        <span className="jcm-live-badge">
          <span className="jcm-dot" aria-hidden="true" /> En vivo
        </span>
      </div>

      <div className="jcm-player__controls">
        <button
          type="button"
          className={`jcm-play ${playing || loading ? '' : 'is-idle'}`}
          onClick={radio.toggle}
          aria-label={playing ? 'Pausar JCM Radio' : loading ? 'Cancelar conexión' : 'Escuchar JCM Radio en vivo'}
        >
          {loading ? (
            <LoaderCircle className="jcm-spin" aria-hidden="true" />
          ) : playing ? (
            <Pause fill="currentColor" aria-hidden="true" />
          ) : (
            <Play fill="currentColor" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="jcm-mute"
          onClick={radio.toggleMute}
          aria-label={radio.muted ? 'Activar sonido' : 'Silenciar'}
          aria-pressed={radio.muted}
        >
          <SpeakerIcon level={volumeLevel} />
        </button>
        {radio.canSetVolume && (
          <input
            className="jcm-volume"
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(effectiveVolume * 100)}
            onChange={(event) => radio.setVolume(Number(event.target.value) / 100)}
            aria-label="Volumen"
            aria-valuetext={`${Math.round(effectiveVolume * 100)} %`}
            style={{ '--fill': `${Math.round(effectiveVolume * 100)}%` } as CSSProperties}
          />
        )}
      </div>

      {radio.status === 'error' && (
        <p className="jcm-player__alert" role="alert">
          No pudimos conectar con la transmisión. Intenta de nuevo en unos segundos o{' '}
          <a href={OFFICIAL_PLAYER_URL} target="_blank" rel="noopener noreferrer">
            abre el reproductor alternativo <ExternalLink aria-hidden="true" />
          </a>
        </p>
      )}
    </section>
  );
}
