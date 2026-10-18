import { CalendarDays } from 'lucide-react';
import heroDesktop from '../../assets/images/hero-studio.webp';
import heroMobile from '../../assets/images/hero-studio-mobile.webp';
import { ListenButton, RadioPlayer } from './RadioPlayer';

export function Hero() {
  return (
    <section id="inicio" className="jcm-hero" aria-labelledby="inicio-titulo">
      <picture className="jcm-hero__media" aria-hidden="true">
        <source media="(max-width: 767px)" srcSet={heroMobile} width={560} height={728} />
        <img src={heroDesktop} alt="" width={1376} height={768} fetchPriority="high" decoding="async" />
      </picture>

      <div className="jcm-container jcm-hero__inner">
        <div className="jcm-hero__content">
          <span className="jcm-pill">
            <span className="jcm-dot" aria-hidden="true" /> Radio online 24/7
          </span>
          <h1 id="inicio-titulo" className="jcm-hero__title">
            <span className="jcm-hero__brand">
              JCM <span className="jcm-red">Radio</span>
            </span>
            <span className="jcm-hero__claim">
              La radio que
              <br /> te acompaña
            </span>
          </h1>
          <p className="jcm-hero__lead">
            Música, información, entretenimiento y buena compañía en un solo lugar. Conectados contigo las 24 horas.
          </p>
          <div className="jcm-hero__actions">
            <ListenButton variant="hero" />
            <a className="jcm-btn jcm-btn--ghost jcm-hero__schedule" href="#programacion">
              <CalendarDays aria-hidden="true" /> Ver programación
            </a>
          </div>
        </div>

        <RadioPlayer />
      </div>
    </section>
  );
}
