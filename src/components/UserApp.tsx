import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { AppConfig } from '../types';
import { NAV_ITEMS } from './site/content';
import { Footer } from './site/Footer';
import { Header } from './site/Header';
import { Hero } from './site/Hero';
import { useActiveSection } from './site/hooks';
import { RadioProvider, safeUrl } from './site/radio';
import { About, Contact, Features, News, Programs } from './site/Sections';
import { getSocialLinks, whatsappHref } from './site/SocialLinks';
import './site/site.css';

const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

function SplashAd({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="jcm-splash" role="dialog" aria-modal="true" aria-label="Anuncio de JCM Radio">
      <img src={imageUrl} alt="Anuncio de JCM Radio" />
      <button type="button" className="jcm-btn jcm-btn--red" onClick={onClose} autoFocus>
        Entrar a la radio
      </button>
    </div>
  );
}

export default function UserApp() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [splashDismissed, setSplashDismissed] = useState(false);
  const activeSection = useActiveSection(SECTION_IDS);

  useEffect(
    () =>
      onSnapshot(
        doc(db, 'config', 'main'),
        (snapshot) => {
          if (snapshot.exists()) setConfig(snapshot.data() as AppConfig);
        },
        (error) => console.warn('Configuración no disponible', error),
      ),
    [],
  );

  const headerSocials = useMemo(() => getSocialLinks(config), [config]);
  const allSocials = useMemo(() => getSocialLinks(config, { includeWhatsapp: true }), [config]);
  const whatsapp = whatsappHref(config?.socialLinks?.whatsapp);
  const splashImage = config?.splashAd?.enabled ? safeUrl(config.splashAd.imageUrl) : '';

  return (
    <RadioProvider>
      <div className="jcm-site">
        <a className="jcm-skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <Header socials={headerSocials} activeSection={activeSection} />
        <main id="contenido">
          <Hero />
          <Features />
          <Programs />
          <News />
          <About />
          <Contact socials={allSocials} whatsapp={whatsapp} />
        </main>
        <Footer socials={allSocials} />
        {splashImage && !splashDismissed && <SplashAd imageUrl={splashImage} onClose={() => setSplashDismissed(true)} />}
      </div>
    </RadioProvider>
  );
}
