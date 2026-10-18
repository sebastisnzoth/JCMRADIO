import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS, type SectionId } from './content';
import { Logo } from './Logo';
import { ListenButton } from './RadioPlayer';
import { SocialLinks, type SocialLink } from './SocialLinks';

export function Header({ socials, activeSection }: { socials: SocialLink[]; activeSection: SectionId }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onResize = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onResize);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`jcm-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="jcm-container jcm-header__inner">
        <a className="jcm-header__brand" href="#inicio" aria-label="JCM Radio — Inicio" onClick={closeMenu}>
          <Logo />
        </a>

        <nav className="jcm-nav" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`jcm-nav__link ${activeSection === item.id ? 'is-active' : ''}`}
              aria-current={activeSection === item.id ? 'location' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="jcm-header__actions">
          <SocialLinks links={socials} />
          <ListenButton variant="header" />
        </div>

        <button
          type="button"
          className="jcm-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="jcm-mobile-menu"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <div id="jcm-mobile-menu" className="jcm-mobile-menu" hidden={!menuOpen}>
        <div className="jcm-container jcm-mobile-menu__inner">
          <nav className="jcm-mobile-menu__nav" aria-label="Navegación móvil">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`jcm-mobile-menu__link ${activeSection === item.id ? 'is-active' : ''}`}
                aria-current={activeSection === item.id ? 'location' : undefined}
                onClick={closeMenu}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <ListenButton variant="menu" onClick={closeMenu} />
          <SocialLinks links={socials} />
        </div>
      </div>
    </header>
  );
}
