import { useState, type ComponentType, type SVGProps } from 'react';
import { ArrowRight, CalendarDays, Radio, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { FEATURES, NEWS, PROGRAMS, formatHour, getLiveProgram, type FeatureIcon, type NewsIconName } from './content';
import { useNow } from './hooks';
import { HeartIcon, MicIcon, MusicNoteIcon, NewsIcon, WhatsappIcon } from './icons';
import { useRadio } from './radio';
import { SocialLinks, type SocialLink } from './SocialLinks';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const FEATURE_ICONS: Record<FeatureIcon, Icon> = {
  music: MusicNoteIcon,
  mic: MicIcon,
  news: NewsIcon,
  heart: HeartIcon,
};

const NEWS_ICONS: Record<NewsIconName, Icon> = {
  heart: HeartIcon,
  radio: Radio,
  calendar: CalendarDays,
};

export async function shareRadio() {
  const url = window.location.href.split('#')[0];
  try {
    if (navigator.share) {
      await navigator.share({ title: 'JCM Radio', text: 'Escucha JCM Radio en vivo, la radio que te acompaña.', url });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado. ¡Compártelo con quien quieras!');
    } else {
      window.prompt('Copia este enlace para compartir JCM Radio:', url);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    toast.error('No se pudo compartir. Copia el enlace desde la barra del navegador.');
  }
}

export function Features() {
  return (
    <section className="jcm-features" aria-label="Lo que encontrarás en JCM Radio">
      <div className="jcm-container">
        <ul className="jcm-features__list">
          {FEATURES.map((feature) => {
            const Icon = FEATURE_ICONS[feature.icon];
            return (
              <li key={feature.title} className="jcm-feature">
                <span className={`jcm-icon-tile jcm-icon-tile--${feature.tone}`}>
                  <Icon />
                </span>
                <span className="jcm-feature__text">
                  <strong>{feature.title}</strong>
                  <span>{feature.text}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function Programs() {
  const now = useNow();
  const live = getLiveProgram(now);
  const [showAll, setShowAll] = useState(false);

  return (
    <section id="programacion" className="jcm-section jcm-programs" aria-labelledby="programacion-titulo">
      <div className="jcm-container">
        <div className="jcm-section-head">
          <h2 id="programacion-titulo" className="jcm-section-title">
            Programación destacada
          </h2>
          <button
            type="button"
            className="jcm-link-arrow"
            aria-expanded={showAll}
            aria-controls="programacion-completa"
            onClick={() => setShowAll((value) => !value)}
          >
            {showAll ? 'Ocultar programación' : 'Ver toda la programación'} <ArrowRight aria-hidden="true" />
          </button>
        </div>

        <ul className="jcm-programs__grid">
          {PROGRAMS.filter((program) => program.featured).map((program) => {
            const isLive = live?.id === program.id;
            return (
              <li key={program.id}>
                <article className={`jcm-program ${isLive ? 'is-live' : ''}`}>
                  <div className="jcm-program__media">
                    {program.image && (
                      <img
                        src={program.image}
                        alt=""
                        width={800}
                        height={446}
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: program.imagePosition }}
                      />
                    )}
                    {isLive && (
                      <span className="jcm-live-badge">
                        <span className="jcm-dot" aria-hidden="true" /> En vivo
                      </span>
                    )}
                  </div>
                  <div className="jcm-program__body">
                    <h3 className="jcm-program__title">{program.title}</h3>
                    <p className="jcm-program__time">
                      {formatHour(program.start)} - {formatHour(program.end)}
                    </p>
                    <p className="jcm-program__desc">{program.description}</p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <div id="programacion-completa" className="jcm-schedule" hidden={!showAll}>
          <p className="jcm-schedule__caption">Programación completa · Hora de Lima, Perú (GMT−5)</p>
          <ol className="jcm-schedule__list">
            {PROGRAMS.map((program) => {
              const isLive = live?.id === program.id;
              return (
                <li key={program.id} className={`jcm-schedule__item ${isLive ? 'is-live' : ''}`}>
                  <span className="jcm-schedule__time">
                    {formatHour(program.start)} - {formatHour(program.end)}
                  </span>
                  <span className="jcm-schedule__name">{program.title}</span>
                  <span className="jcm-schedule__desc">{program.description}</span>
                  {isLive ? (
                    <span className="jcm-live-badge">
                      <span className="jcm-dot" aria-hidden="true" /> Al aire
                    </span>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function News() {
  return (
    <section id="noticias" className="jcm-section jcm-news" aria-labelledby="noticias-titulo">
      <div className="jcm-container">
        <div className="jcm-section-head">
          <h2 id="noticias-titulo" className="jcm-section-title">
            Noticias y novedades
          </h2>
        </div>
        <ul className="jcm-news__grid">
          {NEWS.map((item) => {
            const Icon = NEWS_ICONS[item.icon];
            return (
              <li key={item.id}>
                <article className={`jcm-news-card jcm-news-card--${item.tone}`}>
                  <span className={`jcm-icon-tile jcm-icon-tile--${item.tone}`}>
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="jcm-news-card__tag">{item.tag}</span>
                  <h3 className="jcm-news-card__title">{item.title}</h3>
                  <p className="jcm-news-card__text">{item.text}</p>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function About() {
  const { nowPlaying } = useRadio();
  const stats = [
    { value: '24/7', label: 'Al aire todos los días' },
    nowPlaying?.bitrate
      ? { value: String(nowPlaying.bitrate), unit: 'kbps', label: 'Sonido de alta calidad' }
      : { value: 'HD', label: 'Sonido de alta calidad' },
    { value: 'Lima', label: 'Desde Perú para el mundo' },
  ];

  return (
    <section id="nosotros" className="jcm-section jcm-about" aria-labelledby="nosotros-titulo">
      <div className="jcm-container jcm-about__inner">
        <div>
          <div className="jcm-section-head">
            <h2 id="nosotros-titulo" className="jcm-section-title">
              Sobre nosotros
            </h2>
          </div>
          <p className="jcm-about__lead">Somos JCM Radio, la radio que te acompaña en cada momento del día.</p>
          <p className="jcm-about__body">
            Desde Lima, Perú, transmitimos las 24 horas con el mejor rock, los clásicos que marcaron época y la música de
            hoy, junto a programas en vivo, saludos y dedicatorias. Más que una radio, somos una comunidad que vive la
            música contigo.
          </p>
        </div>
        <ul className="jcm-about__stats">
          {stats.map((stat) => (
            <li key={stat.label} className="jcm-stat">
              <span className="jcm-stat__value">
                {stat.value}
                {stat.unit && <small>{stat.unit}</small>}
              </span>
              <span className="jcm-stat__label">{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Contact({ socials, whatsapp }: { socials: SocialLink[]; whatsapp: string }) {
  return (
    <section id="contacto" className="jcm-section jcm-contact" aria-labelledby="contacto-titulo">
      <div className="jcm-container">
        <div className="jcm-contact__card">
          <div className="jcm-contact__text">
            <div className="jcm-section-head">
              <h2 id="contacto-titulo" className="jcm-section-title">
                Contacto
              </h2>
            </div>
            <p>
              ¿Quieres pedir una canción, enviar un saludo o anunciar con nosotros? Escríbenos y síguenos en nuestras
              redes para no perderte nada.
            </p>
          </div>
          <div className="jcm-contact__actions">
            {whatsapp && (
              <a className="jcm-btn jcm-btn--whatsapp" href={whatsapp} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon /> Escríbenos por WhatsApp
              </a>
            )}
            <button type="button" className="jcm-btn jcm-btn--ghost" onClick={() => void shareRadio()}>
              <Share2 aria-hidden="true" /> Compartir la radio
            </button>
          </div>
          {socials.length > 0 && (
            <div className="jcm-contact__social">
              <span>Síguenos:</span>
              <SocialLinks links={socials} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
